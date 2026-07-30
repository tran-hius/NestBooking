import { INotificationService } from "../interfaces/iNotificationService";
import { INotificationRepository } from "../interfaces/iNotificationRepository";
import { CreateNotificationDto, NotificationResponseDto } from "../dtos/notificationDTO";
import { NotificationMapper } from "../mapper/notificationMapper";

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async createNotification(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.create(data);
    return NotificationMapper.toResponseDto(notification);
  }

  async getUserNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository.findByUser(userId);
    return NotificationMapper.toResponseDtoList(notifications);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    // Optionally check if notification belongs to user
    const notification = await this.notificationRepository.markAsRead(id);
    return NotificationMapper.toResponseDto(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
