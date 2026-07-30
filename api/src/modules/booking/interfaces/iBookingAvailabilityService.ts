import { RoomTypeResponseDto } from "@/modules/hotel/dtos/roomTypeDTO";
import { TxClient } from "@/config/prisma";

export interface IBookingAvailabilityService {
  validateAvailability(
    roomTypeId: string,
    quantity: number,
    checkIn: Date,
    checkOut: Date,
    tx?: TxClient
  ): Promise<RoomTypeResponseDto>;

  calculateAvailableRooms(
    totalRooms: number,
    overlappingBookings: any[],
    checkInDate?: Date,
    checkOutDate?: Date
  ): number;
}
