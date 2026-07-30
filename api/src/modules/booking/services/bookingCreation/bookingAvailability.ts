import { BadRequestError, NotFoundError } from "@/utils/errors";
import { RoomTypeResponseDto } from "@/modules/hotel/dtos/roomTypeDTO";
import { IRoomService } from "@/modules/hotel/interfaces/iRoomService";
import { IRoomTypeService } from "@/modules/hotel/interfaces/iRoomTypeService";
import { BookingReadRepository } from "../../repositories/bookingReadRepository";
import { IBookingAvailabilityService } from "../../interfaces/iBookingAvailabilityService";
import { TxClient } from "@/config/prisma";

export class BookingAvailabilityService implements IBookingAvailabilityService {
  constructor(
    private readonly roomTypeService: IRoomTypeService,
    private readonly roomService: IRoomService,
    private readonly bookingReadRepo: BookingReadRepository,
  ) {}

  async validateAvailability(
    roomTypeId: string,
    quantity: number,
    checkIn: Date,
    checkOut: Date,
    tx?: TxClient
  ): Promise<RoomTypeResponseDto> {
    const roomType = await this.roomTypeService.getRoomTypeById(roomTypeId, tx);

    if (!roomType || !roomType.isActive) {
      throw new NotFoundError(
        "Không tìm thấy loại phòng này hoặc phòng đang bị tạm khóa.",
      );
    }

    const totalRooms = await this.roomService.countActiveRoomsByRoomType(roomTypeId, tx);

    const bookedRooms = await this.bookingReadRepo.getOverlappingBookingsCount(
      roomTypeId,
      checkIn,
      checkOut,
      tx
    );

    const availableRooms = totalRooms - bookedRooms;

    if (availableRooms < quantity) {
      throw new BadRequestError(
        `Rất tiếc! Chỉ còn lại ${availableRooms} phòng trống trong khoảng thời gian bạn chọn.`,
      );
    }

    return roomType;
  }

  calculateAvailableRooms(
    totalRooms: number,
    overlappingBookings: any[],
    checkInDate?: Date,
    checkOutDate?: Date
  ): number {
    let availableQuantity = totalRooms;
    if (checkInDate && checkOutDate) {
      const bookings = overlappingBookings || [];
      const bookedQuantity = bookings.reduce(
        (sum, b) => sum + b.quantity,
        0,
      );
      availableQuantity = availableQuantity - bookedQuantity;
    }
    return availableQuantity;
  }
}
