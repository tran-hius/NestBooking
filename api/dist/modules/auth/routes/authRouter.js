import express from "express";
import { prisma } from "../../../config/prisma.js";
// Import Middleware
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validate, authLimiter, authMiddleware } from "../../../middlewares/index.js";
// Import DTOs
import { SendOtpSchema, VerifyOtpSchema, LoginWithPasswordSchema, ResetPasswordSchema, ChangePasswordSchema, } from "../dtos/authDto.js";
// Import Repositories
import { RefreshTokenRepository } from "../../../modules/auth/repositories/RefreshTokenRepository.js";
import { UserRepository } from "../../../modules/user/repositories/UserRepository.js";
// Import Services
import { OtpService } from "../../../modules/auth/services/otpService.js";
import { TokenService } from "../../../modules/auth/services/tokenService.js";
import { UserService } from "../../../modules/user/services/UserService.js";
import { AuthService } from "../../../modules/auth/services/authService.js";
// Import Controller
import { AuthController } from "../../../modules/auth/controllers/authController.js";
const router = express.Router();
// =====================================================
// KHỞI TẠO DEPENDENCY INJECTION (DI)
// =====================================================
const otpService = new OtpService();
const tokenService = new TokenService();
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository, otpService);
// Bơm tất cả vào AuthService (Tùy theo Constructor hiện tại của bạn)
const authService = new AuthService(otpService, refreshTokenRepository, userService, tokenService);
const authController = new AuthController(authService);
// =====================================================
// GET CURRENT USER
// =====================================================
router.get("/me", 
/*
  #swagger.path = '/api/auth/me'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Lấy thông tin người dùng hiện hành'
  #swagger.security = [{
    "bearerAuth": []
  }]
*/
authMiddleware, asyncHandler(authController.getMe));
// =====================================================
// SEND OTP
// =====================================================
router.post("/send-otp", 
/*
  #swagger.path = '/api/auth/send-otp'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Gửi mã OTP qua email (Dùng chung Đăng ký / Đăng nhập)'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/SendOtpDto"
        }
      }
    }
  }
*/
authLimiter, validate(SendOtpSchema), asyncHandler(authController.sendOtp));
// =====================================================
// VERIFY OTP AND LOGIN
// =====================================================
router.post("/verify-otp", 
/*
  #swagger.path = '/api/auth/verify-otp'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Xác thực mã OTP để Đăng nhập hoặc Tự động đăng ký'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/VerifyOtpDto"
        }
      }
    }
  }
*/
authLimiter, validate(VerifyOtpSchema), asyncHandler(authController.verifyOtpAndLogin));
// =====================================================
// LOGIN WITH PASSWORD
// =====================================================
router.post("/login", 
/*
  #swagger.path = '/api/auth/login'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Đăng nhập bằng Mật khẩu (Dành cho tài khoản đã thiết lập mật khẩu)'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/LoginWithPasswordDto"
        }
      }
    }
  }
*/
authLimiter, validate(LoginWithPasswordSchema), asyncHandler(authController.loginWithPassword));
// =====================================================
// REFRESH TOKENS
// =====================================================
router.post("/refresh", 
/*
  #swagger.path = '/api/auth/refresh'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Làm mới Access Token & Refresh Token'
  #swagger.description = 'Cần đính kèm HttpOnly Cookie chứa refreshToken'
*/
// Không validate Body vì chúng ta đọc refreshToken từ req.cookies
asyncHandler(authController.refreshTokens));
// =====================================================
// LOGOUT
// =====================================================
router.post("/logout", 
/*
  #swagger.path = '/api/auth/logout'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Đăng xuất khỏi hệ thống'
  #swagger.description = 'Sẽ thu hồi Token và xóa HttpOnly Cookie'
*/
asyncHandler(authController.logout));
// =====================================================
// RESET PASSWORD (Quên mật khẩu)
// =====================================================
router.post("/reset-password", 
/*
  #swagger.path = '/api/auth/reset-password'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Đặt lại mật khẩu bằng mã OTP'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ResetPasswordDto"
        }
      }
    }
  }
*/
authLimiter, validate(ResetPasswordSchema), asyncHandler(authController.resetPassword));
// =====================================================
// CHANGE PASSWORD (Đổi mật khẩu)
// =====================================================
router.post("/change-password", 
/*
  #swagger.path = '/api/auth/change-password'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Đổi mật khẩu (Yêu cầu đăng nhập)'
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ChangePasswordDto"
        }
      }
    }
  }
*/
authMiddleware, validate(ChangePasswordSchema), asyncHandler(authController.changePassword));
export default router;
