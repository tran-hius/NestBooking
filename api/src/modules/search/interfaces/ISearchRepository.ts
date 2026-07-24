import { Prisma } from "@/../generated/prisma";
import { SearchHotelDto, SearchHotelResponseDto } from "../dtos/SearchDTO";
import { PaginatedResponse } from "@/modules/hotel/dtos/PaginationDto";

export type SearchHotelPayload = Prisma.HotelGetPayload<{
  include: {
    images: { select: { imageUrl: true } };
    roomTypes: {
      include: {
        rooms: true;
        bookings: true;
      };
    };
  };
}>;

export interface ISearchRepository {
  findHotelsForSearch(
    hotelWhere: Prisma.HotelWhereInput,
    bookingOverlapCondition: Prisma.BookingWhereInput | false,
  ): Promise<SearchHotelPayload[]>;
}

export interface ISearchService {
  searchHotels(
    dto: SearchHotelDto,
  ): Promise<PaginatedResponse<SearchHotelResponseDto>>;
}
