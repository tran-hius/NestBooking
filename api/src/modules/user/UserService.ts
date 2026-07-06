import { UserStatus, Prisma } from "../../../generated/prisma";
import logger from "../../utils/logger";
import { IUserRepository } from "./interfaces/IUserRepository";
import { IUserService } from "./interfaces/IUserService";
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserProfileDto,
} from "./UserDTO";
import { UserMapper } from "./UserMapper";

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;
 
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const userExists = await this.userRepository.findByEmailOrPhone(dto.email);

    if (userExists) {
      logger.warn(`Tạo tài khoản thất bại: Email ${dto.email} đã tồn tại`);
      throw new Error(`Email ${dto.email} đã được đăng ký trên hệ thống!`);
    }

    const data = {
      email: dto.email,
      role: dto.role,
      status: UserStatus.PENDING,
      profile: {
        create: {
          fullName: dto.fullName,
        },
      },
    };

    const createdUser = await this.userRepository.create(data);

    logger.info("User created successfully", {
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
    const user = await this.userRepository.findById(id);
    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return null;
    }
    return UserMapper.toResponseDto(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    logger.debug(`Fetching user details for Email: ${email}`);
    const user = await this.userRepository.findByEmailOrPhone(email);
    if (!user) return null;
    return UserMapper.toResponseDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      logger.warn(`Cập nhật hồ sơ thất bại: Không tìm thấy User ID ${userId}`);
      throw new Error("Tài khoản không tồn tại để cập nhật hồ sơ");
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
        throw new Error(
          "Số điện thoại này đã được sử dụng bởi một tài khoản khác!",
        );
      }
    }

    // Xử lý sau
    const updateData: Prisma.UserUpdateInput = {
      ...(dto.passwordHash && { passwordHash: dto.passwordHash }),
      profile: {
        update: {
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          avatarUrl: dto.avatarUrl,
          address: dto.address,
        },
      },
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    logger.info(`Cập nhật hồ sơ thành công cho User ID: ${userId}`);

    return UserMapper.toResponseDto(updatedUser);
  }

  // Xử lý sau
  async changeUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.updateStatus(userId, status);
    if (status === UserStatus.ACTIVE) {
      await this.userRepository.resetLoginAttempts(userId);
    }
    logger.info(`Trạng thái của User ${userId} đã đổi thành: ${status}`);
    return UserMapper.toResponseDto(updatedUser);
  }

  // Xử lý sau
  async handleLoginFailure(userId: string): Promise<void> {
    // Gọi hàm tăng số lần thử có sẵn của Repo
    await this.userRepository.incrementLoginAttempts(userId);
    logger.warn(`User ID ${userId} nhập sai thông tin đăng nhập.`);

    // Check xem nếu vượt quá 5 lần thì tự động khóa tạm thời
    const user = await this.userRepository.findById(userId);
    if (user && user.loginAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // Khóa trong 15 phút
      const lockUntil = new Date(Date.now() + lockDuration);

      // Gọi hàm update() có sẵn của Repo để cập nhật thời gian khóa
      await this.userRepository.update(userId, { lockUntil });
      logger.error(
        `Tài khoản ID ${userId} đã bị khóa tạm thời 15 phút do nhập sai quá 5 lần.`,
      );
    }
  }

  // Xử lý sau
  async handleLoginSuccess(userId: string): Promise<void> {
    await this.userRepository.resetLoginAttempts(userId);
    logger.info(
      `User ID ${userId} đăng nhập thành công. Đã làm sạch lịch sử đăng nhập sai.`,
    );
  }
}
