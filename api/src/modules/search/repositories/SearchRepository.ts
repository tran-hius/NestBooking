import { PrismaClient, Prisma } from "@/../generated/prisma";
import { ISearchRepository, SearchHotelPayload } from "../interfaces/ISearchRepository";

export class SearchRepository implements ISearchRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findHotelsForSearch(
    hotelWhere: Prisma.HotelWhereInput,
    bookingOverlapCondition: Prisma.BookingWhereInput | false,
  ): Promise<SearchHotelPayload[]> {
    return this.prisma.hotel.findMany({
      where: hotelWhere,
      include: {
        images: { select: { imageUrl: true } },
        roomTypes: {
          where: { isActive: true },
          include: {
            rooms: { where: { isActive: true, status: "AVAILABLE" } },
            bookings: bookingOverlapCondition
              ? { where: bookingOverlapCondition }
              : false,
          },
        },
      },
    });
  }
}
