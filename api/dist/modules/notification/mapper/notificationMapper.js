export class NotificationMapper {
    static toResponseDto(notification) {
        return {
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        };
    }
    static toResponseDtoList(notifications) {
        return notifications.map((n) => this.toResponseDto(n));
    }
}
