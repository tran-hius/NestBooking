import { PrismaClient, Booking, Prisma, BookingStatus } from "../../../../generated/prisma";
import { IBookingReadRepository } from "../interfaces/iBookingReadRepository";

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
        rooms: { include: { room: true } },
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
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            images: {
              select: { imageUrl: true },
              take: 1,
            },
          },
        },
        roomType: { select: { id: true, name: true } },
        rooms: { include: { room: true } },
      },
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
        include: {
          hotel: {
            select: { id: true, name: true }
          },
          roomType: { select: { id: true, name: true } },
          rooms: { include: { room: true } },
        }
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
    tx?: any
  ): Promise<number> {
    const client = tx || this.prisma;
    const overlappingBookings = await client.booking.aggregate({
      _sum: { quantity: true },
      where: {
        roomTypeId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN] },
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

  async getAvailableRooms(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
    quantity: number,
    tx?: any
  ): Promise<string[]> {
    const client = tx || this.prisma;
    
    // Tìm tất cả các roomId thuộc roomTypeId đang ACTIVE
    const rooms = await client.room.findMany({
      where: {
        roomTypeId,
        isActive: true,
      },
      select: { id: true },
    });

    const allRoomIds = rooms.map((r: any) => r.id);

    // Tìm tất cả roomId đang bị trùng lịch
    const overlappingBookings = await client.bookingRoom.findMany({
      where: {
        room: { roomTypeId },
        booking: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN] },
          NOT: {
            OR: [
              { checkOutDate: { lte: checkIn } },
              { checkInDate: { gte: checkOut } },
            ],
          },
        },
      },
      select: { roomId: true },
    });

    const bookedRoomIds = overlappingBookings.map((br: any) => br.roomId);
    
    // Lọc ra các phòng trống
    const availableRoomIds = allRoomIds.filter((id: string) => !bookedRoomIds.includes(id));
    
    if (availableRoomIds.length < quantity) {
      return [];
    }

    return availableRoomIds.slice(0, quantity);
  }
}
