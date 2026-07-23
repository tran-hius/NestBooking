import { BookingResponseDto } from "../dtos/BookingDTO";

export class BookingMapper {
  public static toResponseDto(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      bookingCode: booking.bookingCode, // Mã booking code đã được khai báo
      userId: booking.userId,
      hotelId: booking.hotelId,
      roomTypeId: booking.roomTypeId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      quantity: booking.quantity,
      totalAmount: booking.totalAmount ? Number(booking.totalAmount) : 0,
      status: booking.status,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestEmail: booking.guestEmail,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,

      hotel: booking.hotel
        ? { id: booking.hotel.id, name: booking.hotel.name }
        : undefined,
      roomType: booking.roomType
        ? { id: booking.roomType.id, name: booking.roomType.name }
        : undefined,
      user: booking.user
        ? { id: booking.user.id, email: booking.user.email }
        : undefined,
    };
  }

  public static toResponseDtoList(bookings: any[]): BookingResponseDto[] {
    return bookings.map((booking) => this.toResponseDto(booking));
  }
}
