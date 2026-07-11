import express from "express";
import { prisma } from "../../../lib/prisma";

// Import Middleware
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../../../middlewares/validationMiddleware";

// Import DTOs
import {
  SendOtpSchema,
  VerifyOtpSchema,
  LoginWithPasswordSchema,
} from "../dtos/authDto";

// Import Repositories
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import { UserRepository } from "../../user/repositories/UserRepository";

// Import Services
import { EmailService } from "../services/emailService";
import { OtpService } from "../services/otpService";
import { TokenService } from "../services/tokenService";
import { UserService } from "../../user/services/UserService";
import { AuthService } from "../services/authService";

// Import Controller
import { AuthController } from "../controllers/authController";
import { Transporter } from "../config/transporter";

const router = express.Router();

// =====================================================
// KHỞI TẠO DEPENDENCY INJECTION (DI)
// =====================================================
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

const emailService = new EmailService(Transporter.transporter);
const otpService = new OtpService(emailService);
const tokenService = new TokenService();
const refreshTokenRepository = new RefreshTokenRepository(prisma);

// Bơm tất cả vào AuthService (Tùy theo Constructor hiện tại của bạn)
const authService = new AuthService(
  otpService,
  refreshTokenRepository,
  userService,
  tokenService,
);

const authController = new AuthController(authService);

// =====================================================
// SEND OTP
// =====================================================
router.post(
  "/send-otp",
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
  validate(SendOtpSchema),
  asyncHandler(authController.sendOtp),
);

// =====================================================
// VERIFY OTP AND LOGIN
// =====================================================
router.post(
  "/verify-otp",
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
  validate(VerifyOtpSchema),
  asyncHandler(authController.verifyOtpAndLogin),
);

// =====================================================
// LOGIN WITH PASSWORD
// =====================================================
router.post(
  "/login",
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
  validate(LoginWithPasswordSchema),
  asyncHandler(authController.loginWithPassword),
);

// =====================================================
// REFRESH TOKENS
// =====================================================
router.post(
  "/refresh",
  /*
    #swagger.path = '/api/auth/refresh'
    #swagger.tags = ['Auth']
    #swagger.summary = 'Làm mới Access Token & Refresh Token'
    #swagger.description = 'Cần đính kèm HttpOnly Cookie chứa refreshToken'
  */
  // Không validate Body vì chúng ta đọc refreshToken từ req.cookies
  asyncHandler(authController.refreshTokens),
);

// =====================================================
// LOGOUT
// =====================================================
router.post(
  "/logout",
  /*
    #swagger.path = '/api/auth/logout'
    #swagger.tags = ['Auth']
    #swagger.summary = 'Đăng xuất khỏi hệ thống'
    #swagger.description = 'Sẽ thu hồi Token và xóa HttpOnly Cookie'
  */
  asyncHandler(authController.logout),
);

export default router;
