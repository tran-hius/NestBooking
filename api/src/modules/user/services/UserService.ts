import { UserStatus, Prisma, Role, User } from "../../../../generated/prisma";
import logger from "@/config/logger";
import { IUserRepository } from "@/modules/user/interfaces/IUserRepository";
import { IUserService } from "@/modules/user/interfaces/IUserService";
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserProfileDto,
  SubmitIdentityVerificationDto,
} from "../dtos/UserDTO";
import { UserMapper } from "@/modules/user/mapper/UserMapper";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/utils/errors/errorCustomize";
import { IOtpService } from "@/modules/auth/interfaces/IOtpService";
import { PrismaClient } from "#generated/prisma";
import { AUTH_CONSTANTS } from "@/utils/constants";
import { REDIS_KEYS, redisClient } from "@/infrastructure/redis";
import { TxClient, prisma } from "@/config/prisma";

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;
  private readonly otpService: IOtpService;

  constructor(userRepository: IUserRepository, otpService: IOtpService) {
    this.userRepository = userRepository;
    this.otpService = otpService;
  }

  /**
   * Helper xóa đồng thời cả Profile Cache và Email Cache
   */
  private async clearUserCache(userId: string, email?: string): Promise<void> {
    const keysToDelete = [REDIS_KEYS.USER_PROFILE(userId)];
    if (email) {
      keysToDelete.push(REDIS_KEYS.USER_BY_EMAIL(email.toLowerCase().trim()));
    }
    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
  }

  async createUser(dto: CreateUserDto, tx?: TxClient): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const executeTx = tx ? (fn: (tx: TxClient) => Promise<any>) => fn(tx) : prisma.$transaction;
    const createdUser = await executeTx(async (tx: TxClient) => {
      const userExists = await this.userRepository.findByEmailOrPhone(
        normalizedEmail,
        undefined,
        tx,
      );

      if (userExists) {
        logger.warn(
          `Tạo tài khoản thất bại: Email ${normalizedEmail} đã tồn tại`,
        );
        throw new ConflictError(
          `Email ${normalizedEmail} đã được đăng ký trên hệ thống!`,
        );
      }

      const data = {
        email: normalizedEmail,
        role: dto.role,
        status: UserStatus.PENDING,
        profile: {
          create: {
            fullName: dto.fullName,
          },
        },
      };

      try {
        return await this.userRepository.create(data, tx);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new ConflictError(
            `Email ${normalizedEmail} đã được đăng ký trên hệ thống!`,
          );
        }
        throw error;
      }
    });

    await this.otpService.generateAndSendOtp(createdUser.email);

    logger.info("User created successfully and OTP sent", {
      userId: createdUser.id,
      email: createdUser.email,
    });

    return UserMapper.toResponseDto(createdUser);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    logger.info("Fetching all users from repository");
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseDtoList(users);
  }

  async getUserById(id: string): Promise<UserResponseDto | null> {
    logger.debug(`Fetching user details for ID: ${id}`);
    const cacheKey = REDIS_KEYS.USER_PROFILE(id);

    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      logger.debug(`[Cache Hit] Lấy thông tin user ID: ${id} từ Redis`);
      return JSON.parse(cachedUser);
    }

    logger.debug(`[Cache Miss] Tìm user ID: ${id} trong Database`);
    const user = await this.userRepository.findById(id);
    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return null;
    }

    const responseDto = UserMapper.toResponseDto(user);
    await redisClient.setex(cacheKey, 3600, JSON.stringify(responseDto));
    return responseDto;
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const normalizedEmail = email.toLowerCase().trim();
    logger.debug(`Fetching user details for Email: ${normalizedEmail}`);

    const cacheKey = REDIS_KEYS.USER_BY_EMAIL(normalizedEmail);
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
      logger.debug(
        `[Cache Hit] Lấy thông tin email ${normalizedEmail} từ Redis`,
      );
      return JSON.parse(cachedUser);
    }

    logger.debug(`[Cache Miss] Tìm email ${normalizedEmail} trong Database`);
    const user = await this.userRepository.findByEmailOrPhone(normalizedEmail);
    if (!user) {
      logger.warn(`User with Email ${normalizedEmail} not found`);
      return null;
    }

    const responseDto = UserMapper.toResponseDto(user);
    await redisClient.setex(cacheKey, 3600, JSON.stringify(responseDto));
    return responseDto;
  }

  async getUserWithPasswordByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getUserWithPasswordByEmail(
      email.toLowerCase().trim(),
    );
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto, tx?: TxClient): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId, tx);
    if (!user) {
      logger.warn(`Cập nhật hồ sơ thất bại: Không tìm thấy User ID ${userId}`);
      throw new NotFoundError("Tài khoản không tồn tại để cập nhật hồ sơ");
    }

    if (dto.phoneNumber) {
      const checkPhone = await this.userRepository.findByEmailOrPhone(
        "",
        dto.phoneNumber,
      );
      if (checkPhone && checkPhone.id !== userId) {
        logger.warn(
          `Cập nhật hồ sơ thất bại: Số điện thoại ${dto.phoneNumber} đã bị trùng`,
        );
        throw new ConflictError(
          "Số điện thoại này đã được sử dụng bởi một tài khoản khác!",
        );
      }
    }

    const updateData: Prisma.UserUpdateInput = {
      ...(dto.passwordHash && { passwordHash: dto.passwordHash }),
      profile: {
        upsert: {
          create: {
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            avatarUrl: dto.avatarUrl,
            address: dto.address,
          },
          update: {
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            avatarUrl: dto.avatarUrl,
            address: dto.address,
          },
        },
      },
    };

    const updatedUser = await this.userRepository.update(userId, updateData);

    // Xóa cả 2 cache Profile và Email
    await this.clearUserCache(userId, user.email);

    logger.info(`Cập nhật hồ sơ thành công cho User ID: ${userId}`);
    return UserMapper.toResponseDto(updatedUser);
  }

  async changeUserStatus(userId: string, status: UserStatus, tx?: TxClient): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    const updatedUser = await this.userRepository.updateStatus(userId, status, tx);

    if (status === UserStatus.ACTIVE) {
      await this.userRepository.resetLoginAttempts(userId, tx);
    }

    await this.clearUserCache(userId, user.email);

    logger.info(`Trạng thái của User ${userId} đã đổi thành: ${status}`);
    return UserMapper.toResponseDto(updatedUser);
  }

  async handleLoginFailure(userId: string, tx?: TxClient): Promise<void> {
    await this.userRepository.incrementLoginAttempts(userId, tx);
    logger.warn(`User ID ${userId} nhập sai thông tin đăng nhập.`);

    const user = await this.userRepository.findById(userId, tx);
    if (user && user.loginAttempts >= 5) {
      const lockDuration = AUTH_CONSTANTS.OTP_EXPIRES_MS; // Khóa
      const lockUntil = new Date(Date.now() + lockDuration);

      await this.userRepository.update(userId, { lockUntil });
      await this.clearUserCache(userId, user.email);

      logger.error(
        `Tài khoản ID ${userId} đã bị khóa tạm thời 15 phút do nhập sai quá 5 lần.`,
      );
    }
  }

  async handleLoginSuccess(userId: string, tx?: TxClient): Promise<void> {
    await this.userRepository.resetLoginAttempts(userId, tx);
    logger.info(
      `User ID ${userId} đăng nhập thành công. Đã làm sạch lịch sử đăng nhập sai.`,
    );
  }

  async softDeleteUser(userId: string, tx?: TxClient): Promise<void> {
    logger.warn(`Thực hiện xóa mềm tài khoản ID: ${userId}`);
    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Không tìm thấy tài khoản để xóa.");

    await this.clearUserCache(userId, user.email);
    await this.userRepository.delete(userId);
    logger.info(`Đã ẩn hoàn toàn tài khoản ID ${userId} ra khỏi hệ thống.`);
  }

  async updatePassword(userId: string, passwordHash: string, tx?: TxClient): Promise<void> {
    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    await this.userRepository.updatePassword(userId, passwordHash);
    await this.clearUserCache(userId, user.email);

    logger.info(`User ID ${userId} đã cập nhật mật khẩu thành công.`);
  }

  async restoreUser(userId: string, tx?: TxClient): Promise<UserResponseDto> {
    logger.info(`Khôi phục tài khoản bị xóa mềm có ID: ${userId}`);

    await this.userRepository.restore(userId);

    const restoredUser = await this.userRepository.findById(userId, tx);
    if (!restoredUser) throw new BadRequestError("Khôi phục thất bại.");

    await this.clearUserCache(userId, restoredUser.email);

    logger.info(
      `Tài khoản ID ${userId} đã được khôi phục trạng thái bình thường.`,
    );
    return UserMapper.toResponseDto(restoredUser);
  }

  async submitIdentityVerification(userId: string, dto: SubmitIdentityVerificationDto, tx?: TxClient): Promise<UserResponseDto> {
    logger.info(`User ID ${userId} gửi yêu cầu xác minh danh tính.`);

    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    const updateData: Prisma.UserUpdateInput = {
      status: UserStatus.PENDING,
      agentProfile: {
        upsert: {
          create: {
            businessName: `Agent_${user.email.split("@")[0]}`,
            idNumber: dto.idNumber,
            idCardImageUrl: dto.idCardImageUrl,
            approvalStatus: UserStatus.PENDING,
          },
          update: {
            idNumber: dto.idNumber,
            idCardImageUrl: dto.idCardImageUrl,
            approvalStatus: UserStatus.PENDING,
            rejectedReason: null,
          },
        },
      },
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    await this.clearUserCache(userId, user.email);

    logger.info(
      `Hồ sơ KYC của User ID ${userId} đã được ghi nhận thành công và đang chờ duyệt.`,
    );
    return UserMapper.toResponseDto(updatedUser);
  }

  async approveIdentityVerification(userId: string, tx?: TxClient): Promise<UserResponseDto> {
    logger.info(`Admin duyệt hồ sơ KYC cho User ID: ${userId}`);

    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    const userWithProfile = user as User & { agentProfile?: { approvalStatus: string } | null };
    if (
      userWithProfile.role === Role.AGENT ||
      (userWithProfile.agentProfile &&
        userWithProfile.agentProfile.approvalStatus === UserStatus.ACTIVE)
    ) {
      throw new ConflictError(
        "Tài khoản này đã được xác minh và nâng cấp lên Đối tác rồi!",
      );
    }

    const updateData: Prisma.UserUpdateInput = {
      status: UserStatus.ACTIVE,
      role: Role.AGENT,
      agentProfile: {
        update: {
          approvalStatus: UserStatus.ACTIVE,
          approvedAt: new Date(),
          rejectedReason: null,
        },
      },
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    await this.clearUserCache(userId, user.email);

    logger.info(
      `Tài khoản ID ${userId} đã được chuyển sang trạng thái ACTIVE.`,
    );
    return UserMapper.toResponseDto(updatedUser);
  }

  async rejectIdentityVerification(userId: string, reason: string, tx?: TxClient): Promise<UserResponseDto> {
    logger.info(`Admin từ chối hồ sơ KYC của User ID: ${userId}`);

    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    const userWithProfile = user as User & { agentProfile?: { approvalStatus: string } | null };
    if (
      userWithProfile.role === Role.AGENT ||
      (userWithProfile.agentProfile &&
        userWithProfile.agentProfile.approvalStatus === UserStatus.ACTIVE)
    ) {
      throw new ConflictError(
        "Không thể từ chối hồ sơ của một Đối tác đã được phê duyệt. Vui lòng dùng tính năng Hạ cấp tài khoản!",
      );
    }

    const updateData: Prisma.UserUpdateInput = {
      status: UserStatus.REJECTED,
      role: Role.USER,
      agentProfile: {
        update: {
          approvalStatus: UserStatus.REJECTED,
          rejectedReason: reason,
        },
      },
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    await this.clearUserCache(userId, user.email);

    return UserMapper.toResponseDto(updatedUser);
  }
}


