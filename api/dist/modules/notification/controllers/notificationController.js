import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
export class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    getUserNotifications = async (req, res) => {
        const userId = req.user.userId;
        const notifications = await this.notificationService.getUserNotifications(userId);
        successResponse(res, HttpStatus.OK, "Lấy thông báo thành công", notifications);
    };
    markAsRead = async (req, res) => {
        const id = req.params.id;
        const userId = req.user.userId;
        const notification = await this.notificationService.markAsRead(id, userId);
        successResponse(res, HttpStatus.OK, "Đánh dấu đã đọc thành công", notification);
    };
    markAllAsRead = async (req, res) => {
        const userId = req.user.userId;
        await this.notificationService.markAllAsRead(userId);
        successResponse(res, HttpStatus.OK, "Đánh dấu tất cả đã đọc thành công", null);
    };
}
