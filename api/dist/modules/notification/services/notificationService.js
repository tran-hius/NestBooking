import { NotificationMapper } from "../mapper/notificationMapper.js";
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
        // Optionally check if notification belongs to user
        const notification = await this.notificationRepository.markAsRead(id);
        return NotificationMapper.toResponseDto(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.markAllAsRead(userId);
    }
}
