import { CreateNotificationDto, NotificationResponseDto } from "../dtos/notificationDTO";
export interface INotificationService {
  createNotification(data: CreateNotificationDto): Promise<NotificationResponseDto>;
  getUserNotifications(userId: string): Promise<NotificationResponseDto[]>;
  markAsRead(id: string, userId: string): Promise<NotificationResponseDto>;
  markAllAsRead(userId: string): Promise<void>;
}