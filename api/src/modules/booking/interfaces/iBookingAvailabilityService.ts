import { RoomTypeResponseDto } from "@/modules/hotel/dtos/roomTypeDTO";
import { TxClient } from "@/config/prisma";

export interface IBookingAvailabilityService {
  validateAvailability(
    roomTypeId: string,
    quantity: number,
    checkIn: Date,
    checkOut: Date,
    tx?: TxClient
  ): Promise<{ roomType: RoomTypeResponseDto }>;

  calculateAvailableRooms(
    totalRooms: number,
    overlappingBookings: any[],
    checkInDate?: Date,
    checkOutDate?: Date
  ): number;

  getHotelAvailability(
    hotelId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<Record<string, number>>;
}
