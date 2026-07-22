import { Booking, Prisma } from "../../../../generated/prisma";

export interface IBookingWriteRepository {
  // Tạo 1 hoặc nhiều
  create(data: Prisma.BookingUncheckedCreateInput): Promise<Booking>;
  createMany(
    data: Prisma.BookingUncheckedCreateInput[],
  ): Promise<Prisma.BatchPayload>;

  // Cập nhật 1 hoặc nhiều
  update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking>;
  updateMany(
    where: Prisma.BookingWhereInput,
    data: Prisma.BookingUpdateInput,
  ): Promise<Prisma.BatchPayload>;

  // Xóa / Xóa mềm
  softDelete(id: string): Promise<Booking>;
  restore(id: string): Promise<Booking>;
  deleteMany(where: Prisma.BookingWhereInput): Promise<Prisma.BatchPayload>;
}
