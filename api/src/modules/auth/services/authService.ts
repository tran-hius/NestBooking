import {
  IAuthService,
  IOtpService,
  IRefreshTokenRepository,
  ITokenService,
} from "@/modules/auth/interfaces";
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginWithPasswordDto,
  DeviceMetadata,
  RefreshTokenDto,
  AuthResponseDto,
  ResetPasswordDto,
  ChangePasswordDto,
  OtpTokenResponse,
} from "@/modules/auth/dtos";
import { AUTH_CONSTANTS } from "@/utils/constants";
import { IUserService } from "@/modules/user/interfaces/IUserService";

import { BadRequestError, ConflictError, NotFoundError } from "@/utils/errors";
import { Role, UserStatus } from "@/../generated/prisma";
import { AuthMapper } from "@/modules/auth/mapper/authMapper";
import logger from "@/config/logger";
import { prisma, TxClient } from "@/config/prisma";

export class AuthService implements IAuthService {
  private readonly otpService: IOtpService;
  private readonly refreshTokenRepository: IRefreshTokenRepository;
  private readonly userService: IUserService;
  private readonly tokenService: ITokenService;

  constructor(
    otpService: IOtpService,
    refreshTokenRepo: IRefreshTokenRepository,
    userService: IUserService,
    tokenService: ITokenService,
  ) {
    this.otpService = otpService;
    this.refreshTokenRepository = refreshTokenRepo;
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async getMe(userId: string) {
    // Đã được cache tự động ở UserService.getUserById
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }
    return user;
  }

  async sendOtp(dto: SendOtpDto): Promise<OtpTokenResponse> {
    return await this.otpService.generateAndSendOtp(dto.email);
  }

  async verifyOtpAndLogin(
    dto: VerifyOtpDto,
    device: DeviceMetadata,
    tx?: TxClient,
  ): Promise<AuthResponseDto> {
    const email = await this.otpService.verifyOtp(
      dto.otp,
      dto.otpToken,
    );
    if (!email) {
      throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    // Đã được cache tự động ở UserService.getUserByEmail
    let user = await this.userService.getUserByEmail(email);

    if (!user) {
      user = await this.userService.createUser({
        email: email,
        role: Role.USER,
      });
    } else {
      if (
        user.status === UserStatus.BANNED ||
        user.status === UserStatus.REJECTED
      ) {
        throw new BadRequestError("Tài khoản của bạn đã bị khóa hoặc từ chối.");
      }
    }

    if (user.status === UserStatus.PENDING) {
      user = await this.userService.changeUserStatus(
        user.id,
        UserStatus.ACTIVE,
      );
    }

    await this.userService.handleLoginSuccess(user.id);

    const { accessToken, refreshToken, tokenHash } =
      this.tokenService.generateAuthTokens(user.id, user.role, user.status);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokenHash,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      deviceName: device.deviceName,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
    });

    return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
  }

  async loginWithPassword(
    dto: LoginWithPasswordDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    // Mật khẩu bắt buộc lấy từ DB (không cache passwordHash vì lý do bảo mật)
    const user = await this.userService.getUserWithPasswordByEmail(dto.email);

    if (!user) {
      throw new NotFoundError("Tài khoản hoặc mật khẩu không chính xác.");
    }

    if (
      user.status === UserStatus.BANNED ||
      user.status === UserStatus.REJECTED
    ) {
      throw new ConflictError("Tài khoản đã bị khóa.");
    }

    const isPasswordValid = await this.tokenService.comparePassword(
      dto.password,
      user.passwordHash as string,
    );

    if (!isPasswordValid) {
      await this.userService.handleLoginFailure(user.id);
      throw new NotFoundError("Email hoặc mật khẩu không chính xác.");
    }

    await this.userService.handleLoginSuccess(user.id);

    const { accessToken, refreshToken, tokenHash } =
      this.tokenService.generateAuthTokens(user.id, user.role, user.status);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      deviceName: device.deviceName,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
    });

    return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
  }

  async refreshTokens(
    dto: RefreshTokenDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    if (!dto.refreshToken) {
      throw new ConflictError("RefreshToken không hợp lệ hoặc đã bị chỉnh sửa.");
    }
    this.tokenService.verifyRefreshToken(dto.refreshToken);
    
    const tokenHash = this.tokenService.hashToken(dto.refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.revokedAt) {
      throw new ConflictError(
        "Refresh Token không hợp lệ hoặc đã bị đăng xuất.",
      );
    }
    if (new Date() > storedToken.expiresAt) {
      throw new ConflictError(
        "Refresh Token đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }

    // Đã tận dụng Redis Cache ở UserService.getUserById
    const user = await this.userService.getUserById(storedToken.userId);

    if (!user || user.status === UserStatus.BANNED) {
      throw new ConflictError("Tài khoản không hợp lệ.");
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      tokenHash: newTokenHash,
    } = this.tokenService.generateAuthTokens(user.id, user.role, user.status);

    await prisma.$transaction(async (tx: TxClient) => {
      await this.refreshTokenRepository.revoke(storedToken.id, "ROTATED", tx);
      await this.refreshTokenRepository.create(
        {
          userId: user.id,
          tokenHash: newTokenHash,
          ipAddress: device.ipAddress || storedToken.ipAddress,
          userAgent: device.userAgent || storedToken.userAgent,
          deviceName: device.deviceName || storedToken.deviceName,
          expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
        },
        tx,
      );
    });

    return AuthMapper.toAuthResponseDto(user, accessToken, newRefreshToken);
  }

  async logout(refreshTokenStr: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(refreshTokenStr);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.revokedAt) {
      throw new BadRequestError(
        "Token không hợp lệ hoặc đã được đăng xuất trước đó.",
      );
    }

    await this.refreshTokenRepository.revoke(storedToken.id, "USER_LOGOUT");
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const email = await this.otpService.verifyOtp(
      dto.otp,
      dto.otpToken,
    );
    if (!email) {
      throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
    // Hàm updatePassword trong UserService sẽ tự động làm sạch Cache của User này
    await this.userService.updatePassword(user.id, passwordHash);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    // 💡 Đã tối ưu: Lấy trực tiếp user bằng ID thông qua getUserById (được Cache)
    // thay vì query lồng 2 lần như trước
    const userProfile = await this.userService.getUserById(userId);
    if (!userProfile) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }

    const user = await this.userService.getUserWithPasswordByEmail(
      userProfile.email,
    );
    if (!user) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }

    if (user.passwordHash) {
      if (!dto.oldPassword) {
        throw new BadRequestError("Vui lòng nhập mật khẩu cũ.");
      }
      const isMatch = await this.tokenService.comparePassword(
        dto.oldPassword,
        user.passwordHash as string,
      );
      if (!isMatch) {
        throw new BadRequestError("Mật khẩu cũ không chính xác.");
      }
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
    // Xóa cache và update mật khẩu mới
    await this.userService.updatePassword(user.id, passwordHash);
  }
}
