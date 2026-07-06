import { Request, Response } from "express";
import { UserStatus } from "../../../generated/prisma";

import { IUserService } from "./interfaces/IUserService";

import logger from "../../utils/logger";
import { successResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { ApiError } from "../../utils/errors/apiError";

export class UserController {
  constructor(private readonly userService: IUserService) {}

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
    const { id } = req.params;

    logger.info("[UserController] Get user by id", {
      userId: id,
    });

    const user = await this.userService.getUserById(id as string);

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
    const { id } = req.params;

    logger.info("[UserController] Update profile", {
      userId: id,
    });

    const user = await this.userService.updateProfile(id as string, req.body);

    successResponse(res, HttpStatus.OK, "Cập nhật hồ sơ thành công.", user);
  };

  /**
   * PATCH /users/:id/status
   */
  changeUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    logger.info("[UserController] Change user status", {
      userId: id,
      status,
    });

    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ.");
    }

    const user = await this.userService.changeUserStatus(
      id as string,
      status as UserStatus,
    );

    successResponse(
      res,
      HttpStatus.OK,
      "Cập nhật trạng thái tài khoản thành công.",
      user,
    );
  };
}
