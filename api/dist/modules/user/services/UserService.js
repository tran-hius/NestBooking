import { UserStatus, Prisma } from "../../../../generated/prisma";
import logger from "@/config/logger";
import { UserMapper } from "@/modules/user/mapper/userMapper";
import { NotFoundError, ConflictError, BadRequestError } from "@/utils/errors/errorCustomize";
import { AUTH_CONSTANTS } from "@/utils/constants";
import { REDIS_KEYS, redisClient } from "@/infrastructure/redis";
import { prisma } from "@/config/prisma";
import { UserCacheHelper } from "../utils/userCacheHelper";
export class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(dto, tx) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        const executeTx = tx ? (fn) => fn(tx) : prisma.$transaction.bind(prisma);
        const createdUser = await executeTx(async (tx) => {
            const userExists = await this.userRepository.findByEmailOrPhone(normalizedEmail, undefined, tx);
            if (userExists) {
                logger.warn(`Tạo tài khoản thất bại: Email ${normalizedEmail} đã tồn tại`);
                throw new ConflictError(`Email ${normalizedEmail} đã được đăng ký trên hệ thống!`);
            }
            const data = {
                email: normalizedEmail,
                role: dto.role,
                status: UserStatus.ACTIVE,
                passwordHash: dto.passwordHash,
                profile: {
                    create: {
                        fullName: dto.fullName,
                        phoneNumber: dto.phoneNumber,
                    },
                },
            };
            try {
                return await this.userRepository.create(data, tx);
            }
            catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002") {
                    throw new ConflictError(`Email ${normalizedEmail} đã được đăng ký trên hệ thống!`);
                }
                throw error;
            }
        });
        logger.info("User created successfully by admin", {
            userId: createdUser.id,
            email: createdUser.email,
        });
        return UserMapper.toResponseDto(createdUser);
    }
    async getAllUsers() {
        logger.info("Fetching all users from repository");
        const users = await this.userRepository.findAll();
        return UserMapper.toResponseDtoList(users);
    }
    async updateUserAdmin(userId, dto, tx) {
        logger.info(`[UserService] Admin updating user ID: ${userId}`, { dto });
        const executeTx = tx
            ? (fn) => fn(tx)
            : (fn) => prisma.$transaction(fn);
        return executeTx(async (prismaTx) => {
            const user = await this.userRepository.findById(userId, prismaTx);
            if (!user) {
                throw new NotFoundError("Tài khoản không tồn tại.");
            }
            const updateData = {};
            if (dto.role)
                updateData.role = dto.role;
            if (dto.status)
                updateData.status = dto.status;
            if (dto.fullName !== undefined || dto.phoneNumber !== undefined || dto.address !== undefined) {
                const profileData = {};
                if (dto.fullName !== undefined)
                    profileData.fullName = dto.fullName;
                if (dto.phoneNumber !== undefined)
                    profileData.phoneNumber = dto.phoneNumber;
                if (dto.address !== undefined)
                    profileData.address = dto.address;
                updateData.profile = {
                    upsert: {
                        create: { ...profileData },
                        update: { ...profileData },
                    },
                };
            }
            const updatedUser = await this.userRepository.update(userId, updateData, prismaTx);
            await UserCacheHelper.clearUserCache(userId);
            return UserMapper.toResponseDto(updatedUser);
        });
    }
    async getUserById(id) {
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
    async getUserByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        logger.debug(`Fetching user details for Email: ${normalizedEmail}`);
        const cacheKey = REDIS_KEYS.USER_BY_EMAIL(normalizedEmail);
        const cachedUser = await redisClient.get(cacheKey);
        if (cachedUser) {
            logger.debug(`[Cache Hit] Lấy thông tin email ${normalizedEmail} từ Redis`);
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
    async getUserWithPasswordByEmail(email) {
        return await this.userRepository.getUserWithPasswordByEmail(email.toLowerCase().trim());
    }
    async changeUserStatus(userId, status, tx) {
        const user = await this.userRepository.findById(userId, tx);
        if (!user)
            throw new NotFoundError("Tài khoản không tồn tại");
        const updatedUser = await this.userRepository.updateStatus(userId, status, tx);
        if (status === UserStatus.ACTIVE) {
            await this.userRepository.resetLoginAttempts(userId, tx);
        }
        await UserCacheHelper.clearUserCache(userId, user.email);
        logger.info(`Trạng thái của User ${userId} đã đổi thành: ${status}`);
        return UserMapper.toResponseDto(updatedUser);
    }
    async handleLoginFailure(userId, tx) {
        await this.userRepository.incrementLoginAttempts(userId, tx);
        logger.warn(`User ID ${userId} nhập sai thông tin đăng nhập.`);
        const user = await this.userRepository.findById(userId, tx);
        if (user && user.loginAttempts >= 5) {
            const lockDuration = AUTH_CONSTANTS.OTP_EXPIRES_MS;
            const lockUntil = new Date(Date.now() + lockDuration);
            await this.userRepository.update(userId, { lockUntil });
            await UserCacheHelper.clearUserCache(userId, user.email);
            logger.error(`Tài khoản ID ${userId} đã bị khóa tạm thời 15 phút do nhập sai quá 5 lần.`);
        }
    }
    async handleLoginSuccess(userId, tx) {
        await this.userRepository.resetLoginAttempts(userId, tx);
        logger.info(`User ID ${userId} đăng nhập thành công. Đã làm sạch lịch sử đăng nhập sai.`);
    }
    async softDeleteUser(userId, tx) {
        logger.warn(`Thực hiện xóa mềm tài khoản ID: ${userId}`);
        const user = await this.userRepository.findById(userId, tx);
        if (!user)
            throw new NotFoundError("Không tìm thấy tài khoản để xóa.");
        await UserCacheHelper.clearUserCache(userId, user.email);
        await this.userRepository.delete(userId);
        logger.info(`Đã ẩn hoàn toàn tài khoản ID ${userId} ra khỏi hệ thống.`);
    }
    async restoreUser(userId, tx) {
        logger.info(`Khôi phục tài khoản bị xóa mềm có ID: ${userId}`);
        await this.userRepository.restore(userId);
        const restoredUser = await this.userRepository.findById(userId, tx);
        if (!restoredUser)
            throw new BadRequestError("Khôi phục thất bại.");
        await UserCacheHelper.clearUserCache(userId, restoredUser.email);
        logger.info(`Tài khoản ID ${userId} đã được khôi phục trạng thái bình thường.`);
        return UserMapper.toResponseDto(restoredUser);
    }
}
