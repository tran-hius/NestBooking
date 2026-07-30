import { Prisma } from "../../../../generated/prisma";
import logger from "@/config/logger";
import { IUserRepository } from "@/modules/user/interfaces/iUserRepository";
import { UpdateUserProfileDto, UserResponseDto } from "../dtos/userDTO";
import { UserMapper } from "@/modules/user/mapper/userMapper";
import { NotFoundError, ConflictError } from "@/utils/errors/errorCustomize";
import { TxClient } from "@/config/prisma";
import { UserCacheHelper } from "../utils/userCacheHelper";

export class UserProfileService {
  constructor(private readonly userRepository: IUserRepository) {}

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
    await UserCacheHelper.clearUserCache(userId, user.email);

    logger.info(`Cập nhật hồ sơ thành công cho User ID: ${userId}`);
    return UserMapper.toResponseDto(updatedUser);
  }

  async updatePassword(userId: string, passwordHash: string, tx?: TxClient): Promise<void> {
    const user = await this.userRepository.findById(userId, tx);
    if (!user) throw new NotFoundError("Tài khoản không tồn tại");

    await this.userRepository.updatePassword(userId, passwordHash);
    await UserCacheHelper.clearUserCache(userId, user.email);

    logger.info(`User ID ${userId} đã cập nhật mật khẩu thành công.`);
  }
}
