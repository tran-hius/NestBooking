import { Request, Response } from "express";
import { IAuthService } from "@/modules/auth/interfaces/IAuthService";
import logger from "@/utils/logger";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import { BadRequestError } from "@/utils/errors/errorCustomize";
import { env as appEnv } from "@/config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: appEnv.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Send OTP", { email: req.body.email });
    const result = await this.authService.sendOtp(req.body);
    successResponse(res, HttpStatus.OK, "Mã OTP đã được gửi tới email của bạn", result);
  };

  verifyOtpAndLogin = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Verify OTP and Login", {
      email: req.body.email,
    });

    const deviceMetadata = {
      ipAddress: req.ip || req.socket?.remoteAddress || "Unknown IP",
      userAgent: req.headers["user-agent"] || "Unkown Browser",
      deviceName: (req.headers["x-device-name"] as string) || "Unknown Device",
    };

    const result = await this.authService.verifyOtpAndLogin(
      req.body,
      deviceMetadata,
    );

    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);

    const { refreshToken, ...safeResult } = result.tokens;

    successResponse(res, HttpStatus.OK, "Xác thực và Đăng nhập thành công!", {
      user: result.user,
      tokens: safeResult,
    });
  };

  loginWithPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Login with Password", {
      email: req.body.email,
    });

    const deviceMetadata = {
      ipAddress: req.ip || req.connection?.remoteAddress || "Unknown IP",
      userAgent: req.headers["user-agent"] || "Unknown Browser",
      deviceName: (req.headers["x-device-name"] as string) || "Unknown Device",
    };

    const result = await this.authService.loginWithPassword(
      req.body,
      deviceMetadata,
    );

    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);

    const { refreshToken, ...safeResult } = result.tokens;

    successResponse(res, HttpStatus.OK, "Đăng nhập thành công!", {
      user: result.user,
      tokens: safeResult,
    });
  };

  refreshTokens = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Refresh Tokens");

    const currentRefreshToken = req.cookies?.refreshToken;
    if (!currentRefreshToken) {
      throw new BadRequestError("Không tìm thấy Refresh Token trong Cookie.");
    }

    const deviceMetadata = {
      ipAddress: req.ip || req.socket?.remoteAddress || "Unknown IP",
      userAgent: req.headers["user-agent"] || "Unknown Browser",
      deviceName: (req.headers["x-device-name"] as string) || "Unknown Device",
    };

    const dto = { refreshToken: currentRefreshToken };
    const result = await this.authService.refreshTokens(dto, deviceMetadata);

    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_OPTIONS);

    const { refreshToken, ...safeResult } = result.tokens;

    successResponse(res, HttpStatus.OK, "Làm mới phiên đăng nhập thành công!", {
      user: result.user,
      tokens: safeResult,
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Logout");

    const currentRefreshToken = req.cookies?.refreshToken;

    if (currentRefreshToken) {
      await this.authService.logout(currentRefreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
    });

    successResponse(res, HttpStatus.OK, "Đăng xuất thành công!");
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Reset Password", { email: req.body.email });
    await this.authService.resetPassword(req.body);
    successResponse(res, HttpStatus.OK, "Mật khẩu đã được đặt lại thành công!");
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    logger.info("[AuthController] Change Password", { userId: req.user?.userId });
    if (!req.user?.userId) {
      throw new BadRequestError("Không tìm thấy thông tin người dùng.");
    }
    
    await this.authService.changePassword(req.user.userId, req.body);
    successResponse(res, HttpStatus.OK, "Đổi mật khẩu thành công!");
  };
}