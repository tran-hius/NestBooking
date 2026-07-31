import { INotificationService } from "../interfaces/iNotificationService";
import { INotificationRepository } from "../interfaces/iNotificationRepository";
import { CreateNotificationDto, NotificationResponseDto } from "../dtos/notificationDTO";
import { NotificationMapper } from "../mapper/notificationMapper";
import { ForbiddenError, NotFoundError } from "@/utils/errors";

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
    const existingNotification = await this.notificationRepository.findById(id);
    if (!existingNotification) throw new NotFoundError("Không tìm thấy thông báo.");
    if (existingNotification.userId !== userId) {
      throw new ForbiddenError("Bạn không có quyền cập nhật thông báo này.");
    }

    const notification = await this.notificationRepository.markAsRead(id);
    return NotificationMapper.toResponseDto(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
