import { Notification } from "#generated/prisma";
export interface INotificationRepository {
  create(data: any): Promise<Notification>;
  findByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}