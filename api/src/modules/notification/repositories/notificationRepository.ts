import { PrismaClient, Notification } from "#generated/prisma";
import { INotificationRepository } from "../interfaces/iNotificationRepository";

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: any): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({ 
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}
