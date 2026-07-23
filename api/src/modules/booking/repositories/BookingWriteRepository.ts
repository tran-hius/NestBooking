import { PrismaClient, Booking, Prisma, BookingStatus } from "../../../../generated/prisma";
import { IBookingWriteRepository } from "../interfaces/IBookingWriteRepository";

export class BookingWriteRepository implements IBookingWriteRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.BookingUncheckedCreateInput): Promise<Booking> {
    return this.prisma.booking.create({ data });
  }

  async createMany(
    data: Prisma.BookingUncheckedCreateInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.booking.createMany({ data });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  async updateMany(
    where: Prisma.BookingWhereInput,
    data: Prisma.BookingUpdateInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.booking.updateMany({
      where,
      data,
    });
  }

  async softDelete(id: string): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.PENDING },
    });
  }

  async deleteMany(
    where: Prisma.BookingWhereInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.booking.deleteMany({ where });
  }
}
