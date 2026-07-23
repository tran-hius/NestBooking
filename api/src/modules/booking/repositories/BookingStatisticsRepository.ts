import { PrismaClient, BookingStatus } from "../../../../generated/prisma";
import { IBookingStatisticsRepository } from "../interfaces/IBookingStatisticsRepository";

export class BookingStatisticsRepository implements IBookingStatisticsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async revenue(
    hotelId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        hotelId,
        status: BookingStatus.COMPLETED, 
        checkInDate: { gte: startDate },
        checkOutDate: { lte: endDate },
      },
    });
    return Number(result._sum.totalAmount || 0);
  }

  async occupancy(
    hotelId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.booking.aggregate({
      _sum: { quantity: true },
      where: {
        hotelId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        checkInDate: { gte: startDate },
        checkOutDate: { lte: endDate },
      },
    });
    return result._sum.quantity || 0;
  }
}
