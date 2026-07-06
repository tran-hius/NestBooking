import { Request, Response } from "express";

import { IUserService } from "./interfaces/IUserService";

import logger from "../../utils/logger";
import { successResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";

export class UserController {
  private readonly userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService
  }
  /**
   * GET /users
   */
  getAllUsers = async (_: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Get all users");

    const users = await this.userService.getAllUsers();

    successResponse(
      res,
      HttpStatus.OK,
      "Lấy danh sách người dùng thành công.",
      users,
    );
  };

  /**
   * GET /users/:id
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Get user by id", {
      userId: req.params.id,
    });

    const user = await this.userService.getUserById(req.params.id as string);

    successResponse(
      res,
      HttpStatus.OK,
      "Lấy thông tin người dùng thành công.",
      user,
    );
  };

  /**
   * POST /users
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Create user", {
      email: req.body.email,
    });

    const user = await this.userService.createUser(req.body);

    successResponse(res, HttpStatus.CREATED, "Tạo tài khoản thành công.", user);
  };

  /**
   * PUT /users/:id/profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Update profile", {
      userId: req.params.id,
    });

    const user = await this.userService.updateProfile(
      req.params.id as string,
      req.body,
    );

    successResponse(res, HttpStatus.OK, "Cập nhật hồ sơ thành công.", user);
  };

  /**
   * PATCH /users/:id/status
   */
  changeUserStatus = async (req: Request, res: Response): Promise<void> => {
    logger.info("[UserController] Change user status", {
      userId: req.params.id,
      status: req.body.status,
    });

    const user = await this.userService.changeUserStatus(
      req.params.id as string,
      req.body.status,
    );

    successResponse(
      res,
      HttpStatus.OK,
      "Cập nhật trạng thái tài khoản thành công.",
      user,
    );
  };
}
