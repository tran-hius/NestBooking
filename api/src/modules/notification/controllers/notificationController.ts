import { Request, Response } from "express";
import { INotificationService } from "../interfaces/iNotificationService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const notifications = await this.notificationService.getUserNotifications(userId);
    successResponse(res, HttpStatus.OK, "Lấy thông báo thành công", notifications);
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const notification = await this.notificationService.markAsRead(id, userId);
    successResponse(res, HttpStatus.OK, "Đánh dấu đã đọc thành công", notification);
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    await this.notificationService.markAllAsRead(userId);
    successResponse(res, HttpStatus.OK, "Đánh dấu tất cả đã đọc thành công", null);
  };
}
