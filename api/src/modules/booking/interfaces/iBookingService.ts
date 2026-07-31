import { BookingResponseDto, CreateBookingDto } from "../dtos/bookingDTO";
import { BookingStatus } from "#generated/prisma";

export interface IBookingService {
  createBooking(userId: string, data: CreateBookingDto, ipAddr?: string): Promise<BookingResponseDto>;
  getBookingById(id: string, requestId: string, requestRole: string): Promise<BookingResponseDto>;
  getUserBookings(userId: string): Promise<BookingResponseDto[]>;
  getAllBookings(): Promise<BookingResponseDto[]>;
  getHotelBookings(hotelId: string, agentId: string): Promise<BookingResponseDto[]>;
  updateBookingStatus(id: string, requesterId: string, requesterRole: string, status: BookingStatus): Promise<BookingResponseDto>;
  cancelBooking(id: string, userId: string): Promise<BookingResponseDto>;

  handlePaymentCallback(bookingId: string, amount: number, transactionId: string): Promise<{ rspCode: string; message: string }>;
}
