import { IAuthService } from "../interfaces/IAuthService";
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginWithPasswordDto,
  DeviceMetadata,
  RefreshTokenDto,
  AuthResponseDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "../dtos/authDto";
import { IEmailService } from "../interfaces/IEmailService";
import { IOtpService } from "../interfaces/IOtpService"; // Đã sửa chính tả: IOtpServoce -> IOtpService
import { IRefreshTokenRepository } from "../interfaces/IRefreshTokenRepository";
import { IUserService } from "../../user/interfaces/IUserService";


import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../utils/errors/errorCustomize";
import { Role, UserStatus } from "../../../../generated/prisma";
import { ITokenService } from "../interfaces/ITokenService";
import { AuthMapper } from "../mapper/authMapper";

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

  async sendOtp(dto: SendOtpDto): Promise<void> {
    return await this.otpService.generateAndSendOtp(dto.email);
  }

  async verifyOtpAndLogin(
    dto: VerifyOtpDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);
    if (!isValid) {
      throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
    let user = await this.userService.getUserByEmail(dto.email);

    if (!user) {
      const defaultName = dto.email.split("@")[0];
      user = await this.userService.createUser({
        email: dto.email,
        fullName: defaultName,
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
      user = await this.userService.changeUserStatus(user.id, UserStatus.ACTIVE);
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
  }

  async loginWithPassword(
    dto: LoginWithPasswordDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    const user = await (this.userService as any).getUserWithPasswordByEmail(
      dto.email,
    );

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
      user.passwordHash,
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
  }

  async refreshTokens(
    dto: RefreshTokenDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto> {
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

    const user = await this.userService.getUserById(storedToken.userId);

    if (!user || user.status === UserStatus.BANNED) {
      throw new ConflictError("Tài khoản không hợp lệ.");
    }

    await this.refreshTokenRepository.revoke(storedToken.id, "ROTATED");

    const {
      accessToken,
      refreshToken: newRefreshToken,
      tokenHash: newTokenHash,
    } = this.tokenService.generateAuthTokens(user.id, user.role, user.status);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      ipAddress: device.ipAddress || storedToken.ipAddress,
      userAgent: device.userAgent || storedToken.userAgent,
      deviceName: device.deviceName || storedToken.deviceName,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);
    if (!isValid) {
      throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
    await this.userService.updatePassword(user.id, passwordHash);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await (this.userService as any).getUserWithPasswordByEmail(
      (await this.userService.getUserById(userId))?.email || ""
    );

    if (!user) {
      throw new NotFoundError("Tài khoản không tồn tại.");
    }

    const isMatch = await this.tokenService.comparePassword(
      dto.oldPassword,
      user.passwordHash
    );

    if (!isMatch) {
      throw new BadRequestError("Mật khẩu cũ không chính xác.");
    }

    const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
    await this.userService.updatePassword(user.id, passwordHash);
  }
}
