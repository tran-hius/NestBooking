import { PrismaClient, Booking, Prisma, BookingStatus } from "../../../../generated/prisma";
import { IBookingReadRepository } from "../interfaces/IBookingReadRepository";

export class BookingReadRepository implements IBookingReadRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        hotel: { select: { id: true, name: true, ownerId: true } },
        roomType: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });
  }

  async findByBookingCode(code: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        hotel: true,
        roomType: true,
      },
    });
  }

  async findMany(
    where?: Prisma.BookingWhereInput,
    skip?: number,
    take?: number,
  ): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async search(keyword: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        OR: [
          { guestName: { contains: keyword, mode: "insensitive" } },
          { guestPhone: { contains: keyword } },
          { bookingCode: { contains: keyword } },
        ],
      },
    });
  }

  async pagination(
    where: Prisma.BookingWhereInput,
    page: number,
    limit: number,
  ): Promise<{ data: Booking[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { data, total };
  }

  async exists(where: Prisma.BookingWhereInput): Promise<boolean> {
    const count = await this.prisma.booking.count({ where });
    return count > 0;
  }

  async count(where?: Prisma.BookingWhereInput): Promise<number> {
    return this.prisma.booking.count({ where });
  }

  async getOverlappingBookingsCount(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number> {
    const overlappingBookings = await this.prisma.booking.aggregate({
      _sum: { quantity: true },
      where: {
        roomTypeId,
        status: { in: [BookingStatus.CONFIRMED] },
        NOT: {
          OR: [
            { checkOutDate: { lte: checkIn } },
            { checkInDate: { gte: checkOut } },
          ],
        },
      },
    });
    return overlappingBookings._sum.quantity || 0;
  }
}
