import { Request, Response } from "express";
import { IUserService } from "@/modules/user/interfaces/iUserService";
import { UserProfileService } from "../services/userProfileService";
import logger from "@/config/logger";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import { BadRequestError } from "@/utils/errors";
import { IUploadService } from "@/modules/upload/interfaces/iUploadService";

export class UserController {
  constructor(
    private readonly userService: IUserService,
    private readonly userProfileService: UserProfileService,
    private readonly uploadService: IUploadService
  ) {}

  /**
   * GET /users
   */
  getAllUsers = async (_: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Get all users");
    const users = await this.userService.getAllUsers();
    successResponse(res, HttpStatus.OK, "Lấy danh sách người dùng thành công.", users);
  };

  /**
   * GET /users/:id
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Get user by id", { userId: req.params.id });
    const user = await this.userService.getUserById(req.params.id as string);
    successResponse(res, HttpStatus.OK, "Lấy thông tin người dùng thành công.", user);
  };

  /**
   * POST /users
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Create user", { email: req.body.email });
    const user = await this.userService.createUser(req.body);
    successResponse(res, HttpStatus.CREATED, "Tạo tài khoản thành công.", user);
  };

  /**
   * PUT /users/:id/profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Update profile", { userId: req.params.id });
    const user = await this.userProfileService.updateProfile(req.params.id as string, req.body);
    successResponse(res, HttpStatus.OK, "Cập nhật hồ sơ thành công.", user);
  };

  /**
   * PUT /users/:id/admin
   */
  updateUserAdmin = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Admin update user", { userId: req.params.id });
    const user = await this.userService.updateUserAdmin(req.params.id as string, req.body);
    successResponse(res, HttpStatus.OK, "Cập nhật người dùng thành công.", user);
  };

  /**
   * PATCH /users/:id/status
   */
  changeUserStatus = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Change user status", { userId: req.params.id, status: req.body.status });
    const user = await this.userService.changeUserStatus(req.params.id as string, req.body.status);
    successResponse(res, HttpStatus.OK, "Cập nhật trạng thái tài khoản thành công.", user);
  };

  /**
   * DELETE /users/:id
   */
  softDeleteUser = async (req: Request, res: Response): Promise<void> => {
    logger.warn("[UserController] Soft delete user", { userId: req.params.id });
    await this.userService.softDeleteUser(req.params.id as string);
    successResponse(res, HttpStatus.OK, "Xóa tài khoản thành công (Xóa mềm).");
  };

  /**
   * POST /users/:id/restore
   */
  restoreUser = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Restore user", { userId: req.params.id });
    const user = await this.userService.restoreUser(req.params.id as string);
    successResponse(res, HttpStatus.OK, "Khôi phục tài khoản thành công.", user);
  };



  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError("Vui lòng chọn một file ảnh để tải lên.");
    }
    const userId = req.user!.userId;
    const publicId = `avatar_${userId}_${Date.now()}`;
    const imageUrl = await this.uploadService.uploadImage(req.file.buffer, "booking-avatars", publicId);
    const updatedUser = await this.userProfileService.updateProfile(userId, { avatarUrl: imageUrl });
    successResponse(res, HttpStatus.OK, "Cập nhật ảnh đại diện thành công!", updatedUser);
  };
}
