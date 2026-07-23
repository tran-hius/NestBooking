import { Booking, Prisma } from "../../../../generated/prisma";

export interface IBookingReadRepository {
  findById(id: string): Promise<Booking | null>;
  findByBookingCode(code: string): Promise<Booking | null>;
  findMany(
    where?: Prisma.BookingWhereInput,
    skip?: number,
    take?: number,
  ): Promise<Booking[]>;
  search(keyword: string): Promise<Booking[]>;

  // Trả về kèm tổng số dòng để làm phân trang (Pagination)
  pagination(
    where: Prisma.BookingWhereInput,
    page: number,
    limit: number,
  ): Promise<{ data: Booking[]; total: number }>;

  exists(where: Prisma.BookingWhereInput): Promise<boolean>;
  count(where?: Prisma.BookingWhereInput): Promise<number>;
  getOverlappingBookingsCount(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number>;
}
