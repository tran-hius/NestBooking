import { NotificationMapper } from "../mapper/notificationMapper";
import { ForbiddenError, NotFoundError } from "@/utils/errors";
export class NotificationService {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async createNotification(data) {
        const notification = await this.notificationRepository.create(data);
        return NotificationMapper.toResponseDto(notification);
    }
    async getUserNotifications(userId) {
        const notifications = await this.notificationRepository.findByUser(userId);
        return NotificationMapper.toResponseDtoList(notifications);
    }
    async markAsRead(id, userId) {
        const existingNotification = await this.notificationRepository.findById(id);
        if (!existingNotification)
            throw new NotFoundError("Không tìm thấy thông báo.");
        if (existingNotification.userId !== userId) {
            throw new ForbiddenError("Bạn không có quyền cập nhật thông báo này.");
        }
        const notification = await this.notificationRepository.markAsRead(id);
        return NotificationMapper.toResponseDto(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.markAllAsRead(userId);
    }
}
