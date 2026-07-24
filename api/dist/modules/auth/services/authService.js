import { AUTH_CONSTANTS } from "../../../utils/constants.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../../utils/errors/index.js";
import { Role, UserStatus } from "../../../../generated/prisma/index.js";
import { AuthMapper } from "../../../modules/auth/mapper/authMapper.js";
import logger from "../../../config/logger.js";
import { prisma } from "../../../config/prisma.js";
export class AuthService {
    otpService;
    refreshTokenRepository;
    userService;
    tokenService;
    constructor(otpService, refreshTokenRepo, userService, tokenService) {
        this.otpService = otpService;
        this.refreshTokenRepository = refreshTokenRepo;
        this.userService = userService;
        this.tokenService = tokenService;
    }
    async getMe(userId) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new NotFoundError("Tài khoản không tồn tại.");
        }
        return user;
    }
    async sendOtp(dto) {
        return await this.otpService.generateAndSendOtp(dto.email);
    }
    async verifyOtpAndLogin(dto, device, tx) {
        const email = await this.otpService.verifyOtp(dto.otp, dto.otpToken);
        if (!email) {
            throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }
        const executeTx = tx ? (fn) => fn(tx) : (fn) => prisma.$transaction(fn);
        return executeTx(async (prismaTx) => {
            let user = await this.userService.getUserByEmail(email);
            if (!user) {
                user = await this.userService.createUser({
                    email: email,
                    role: Role.USER,
                }, prismaTx);
            }
            else {
                if (user.status === UserStatus.BANNED || user.status === UserStatus.REJECTED) {
                    throw new BadRequestError("Tài khoản của bạn đã bị khóa hoặc từ chối.");
                }
            }
            if (user.status === UserStatus.PENDING) {
                user = await this.userService.changeUserStatus(user.id, UserStatus.ACTIVE, prismaTx);
            }
            await this.userService.handleLoginSuccess(user.id, prismaTx);
            const { accessToken, refreshToken, tokenHash } = this.tokenService.generateAuthTokens(user.id, user.role, user.status);
            await this.refreshTokenRepository.create({
                userId: user.id,
                tokenHash: tokenHash,
                ipAddress: device.ipAddress,
                userAgent: device.userAgent,
                deviceName: device.deviceName,
                expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
            }, prismaTx);
            logger.info(`[AuthService] OTP Login successful for user: ${user.email}`);
            return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
        });
    }
    async loginWithPassword(dto, device, tx) {
        const user = await this.userService.getUserWithPasswordByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedError("Tài khoản hoặc mật khẩu không chính xác.");
        }
        if (user.status === UserStatus.BANNED || user.status === UserStatus.REJECTED) {
            throw new UnauthorizedError("Tài khoản đã bị khóa.");
        }
        const isPasswordValid = await this.tokenService.comparePassword(dto.password, user.passwordHash);
        const executeTx = tx ? (fn) => fn(tx) : (fn) => prisma.$transaction(fn);
        return executeTx(async (prismaTx) => {
            if (!isPasswordValid) {
                await this.userService.handleLoginFailure(user.id, prismaTx);
                throw new UnauthorizedError("Email hoặc mật khẩu không chính xác.");
            }
            await this.userService.handleLoginSuccess(user.id, prismaTx);
            const { accessToken, refreshToken, tokenHash } = this.tokenService.generateAuthTokens(user.id, user.role, user.status);
            await this.refreshTokenRepository.create({
                userId: user.id,
                tokenHash,
                ipAddress: device.ipAddress,
                userAgent: device.userAgent,
                deviceName: device.deviceName,
                expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
            }, prismaTx);
            logger.info(`[AuthService] Password login successful for user: ${user.email}`);
            return AuthMapper.toAuthResponseDto(user, accessToken, refreshToken);
        });
    }
    async refreshTokens(dto, device, tx) {
        if (!dto.refreshToken) {
            throw new BadRequestError("RefreshToken không hợp lệ hoặc đã bị chỉnh sửa.");
        }
        this.tokenService.verifyRefreshToken(dto.refreshToken);
        const tokenHash = this.tokenService.hashToken(dto.refreshToken);
        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!storedToken || storedToken.revokedAt) {
            if (storedToken && storedToken.revokedAt) {
                logger.warn(`[AuthService] Token reuse detected for user ${storedToken.userId}! Revoking all tokens.`);
                await this.refreshTokenRepository.revokeAllForUser(storedToken.userId, "TOKEN_REUSE_DETECTED");
            }
            throw new UnauthorizedError("Refresh Token không hợp lệ hoặc đã bị đăng xuất.");
        }
        if (new Date() > storedToken.expiresAt) {
            throw new UnauthorizedError("Refresh Token đã hết hạn. Vui lòng đăng nhập lại.");
        }
        const user = await this.userService.getUserById(storedToken.userId);
        if (!user || user.status === UserStatus.BANNED) {
            throw new UnauthorizedError("Tài khoản không hợp lệ.");
        }
        const { accessToken, refreshToken: newRefreshToken, tokenHash: newTokenHash, } = this.tokenService.generateAuthTokens(user.id, user.role, user.status);
        const executeTx = tx ? (fn) => fn(tx) : (fn) => prisma.$transaction(fn);
        await executeTx(async (prismaTx) => {
            await this.refreshTokenRepository.revoke(storedToken.id, "ROTATED", prismaTx);
            await this.refreshTokenRepository.create({
                userId: user.id,
                tokenHash: newTokenHash,
                ipAddress: device.ipAddress || storedToken.ipAddress,
                userAgent: device.userAgent || storedToken.userAgent,
                deviceName: device.deviceName || storedToken.deviceName,
                expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_MS),
            }, prismaTx);
        });
        logger.info(`[AuthService] Tokens refreshed successfully for user: ${user.email}`);
        return AuthMapper.toAuthResponseDto(user, accessToken, newRefreshToken);
    }
    async logout(refreshTokenStr) {
        const tokenHash = this.tokenService.hashToken(refreshTokenStr);
        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!storedToken || storedToken.revokedAt) {
            logger.warn(`[AuthService] Logout failed - Invalid or already revoked token: ${tokenHash}`);
            throw new BadRequestError("Token không hợp lệ hoặc đã được đăng xuất trước đó.");
        }
        await this.refreshTokenRepository.revoke(storedToken.id, "USER_LOGOUT");
        logger.info(`[AuthService] User logged out successfully. Token ID: ${storedToken.id}`);
    }
    async resetPassword(dto) {
        const email = await this.otpService.verifyOtp(dto.otp, dto.otpToken);
        if (!email) {
            throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new NotFoundError("Tài khoản không tồn tại.");
        }
        const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
        await this.userService.updatePassword(user.id, passwordHash);
        await this.refreshTokenRepository.revokeAllForUser(user.id, "PASSWORD_RESET");
        logger.info(`[AuthService] Password reset successful for user: ${email}`);
    }
    async changePassword(userId, dto) {
        const userProfile = await this.userService.getUserById(userId);
        if (!userProfile) {
            throw new NotFoundError("Tài khoản không tồn tại.");
        }
        const user = await this.userService.getUserWithPasswordByEmail(userProfile.email);
        if (!user) {
            throw new NotFoundError("Tài khoản không tồn tại.");
        }
        if (user.passwordHash) {
            if (!dto.oldPassword) {
                throw new BadRequestError("Vui lòng nhập mật khẩu cũ.");
            }
            const isMatch = await this.tokenService.comparePassword(dto.oldPassword, user.passwordHash);
            if (!isMatch) {
                throw new BadRequestError("Mật khẩu cũ không chính xác.");
            }
        }
        const passwordHash = await this.tokenService.hashPassword(dto.newPassword);
        await this.userService.updatePassword(user.id, passwordHash);
        logger.info(`[AuthService] Password changed successfully for user ID: ${user.id}`);
    }
}
