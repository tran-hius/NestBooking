import { BookingResponseDto, CreateBookingDto } from "../dtos/bookingDTO";

export interface IBookingCreationService {
  createBooking(
    userId: string,
    data: CreateBookingDto,
    ipAddr?: string
  ): Promise<BookingResponseDto>;
}
