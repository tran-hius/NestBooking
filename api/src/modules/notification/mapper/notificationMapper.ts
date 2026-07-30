import { NotificationResponseDto } from "../dtos/notificationDTO";
import { Notification } from "#generated/prisma";

export class NotificationMapper {
  public static toResponseDto(notification: Notification): NotificationResponseDto {
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

  public static toResponseDtoList(notifications: Notification[]): NotificationResponseDto[] {
    return notifications.map((n) => this.toResponseDto(n));
  }
}
