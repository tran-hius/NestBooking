import logger from "@/config/logger";
import { UserMapper } from "@/modules/user/mapper/userMapper";
import { NotFoundError, ConflictError } from "@/utils/errors/errorCustomize";
import { UserCacheHelper } from "../utils/userCacheHelper";
export class UserProfileService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async updateProfile(userId, dto, tx) {
        const user = await this.userRepository.findById(userId, tx);
        if (!user) {
            logger.warn(`Cập nhật hồ sơ thất bại: Không tìm thấy User ID ${userId}`);
            throw new NotFoundError("Tài khoản không tồn tại để cập nhật hồ sơ");
        }
        if (dto.phoneNumber) {
            const checkPhone = await this.userRepository.findByEmailOrPhone("", dto.phoneNumber);
            if (checkPhone && checkPhone.id !== userId) {
                logger.warn(`Cập nhật hồ sơ thất bại: Số điện thoại ${dto.phoneNumber} đã bị trùng`);
                throw new ConflictError("Số điện thoại này đã được sử dụng bởi một tài khoản khác!");
            }
        }
        const updateData = {
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
    async updatePassword(userId, passwordHash, tx) {
        const user = await this.userRepository.findById(userId, tx);
        if (!user)
            throw new NotFoundError("Tài khoản không tồn tại");
        await this.userRepository.updatePassword(userId, passwordHash);
        await UserCacheHelper.clearUserCache(userId, user.email);
        logger.info(`User ID ${userId} đã cập nhật mật khẩu thành công.`);
    }
}
