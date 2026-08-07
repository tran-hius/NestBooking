import { BookingStatus, PaymentStatus, Role } from "#generated/prisma";
import { IBookingReadRepository } from "../interfaces/iBookingReadRepository";
import { IBookingWriteRepository } from "../interfaces/iBookingWriteRepository";
import { IBookingService } from "../interfaces/iBookingService";
import { IBookingCreationService } from "../interfaces/iBookingCreationService";
import { BookingResponseDto, CreateBookingDto } from "../dtos/bookingDTO";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import { BookingMapper } from "../mapper/bookingMapper";
import { IHotelService } from "@/modules/hotel/interfaces/iHotelService";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import { BookingPostProcess } from "./bookingCreation/bookingPostProcess";
import { prisma } from "@/config/prisma";
import { RoomStatus } from "#generated/prisma";

export class BookingService implements IBookingService {
  constructor(
    private readonly readRepo: IBookingReadRepository,

    private readonly hotelService: IHotelService,
    private readonly bookingCreationService: IBookingCreationService,
    private readonly bookingPostProcess: BookingPostProcess,
    private readonly bookingAvailabilityService: import("../interfaces/iBookingAvailabilityService").IBookingAvailabilityService,
  ) {}

  async createBooking(
    userId: string,
    data: CreateBookingDto,
    ipAddr: string = "127.0.0.1",
  ): Promise<BookingResponseDto> {
    return this.bookingCreationService.createBooking(userId, data, ipAddr);
  }

  async getHotelAvailability(
    hotelId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<Record<string, number>> {
    return this.bookingAvailabilityService.getHotelAvailability(hotelId, checkIn, checkOut);
  }

  private async clearBookingCache(
    bookingId: string,
    userId: string,
    hotelId: string,
  ): Promise<void> {
    await redisClient.del(
      REDIS_KEYS.BOOKING(bookingId),
      REDIS_KEYS.USER_BOOKINGS(userId),
      REDIS_KEYS.HOTEL_BOOKINGS(hotelId),
    );
  }

  async getBookingById(
    id: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<BookingResponseDto> {
    const cacheKey = REDIS_KEYS.BOOKING(id);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const booking = JSON.parse(cached) as BookingResponseDto;
      await this.assertCanViewBooking(booking, requesterId, requesterRole);
      return booking;
    }

    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng");
    }

    const response = BookingMapper.toResponseDto(booking);
    await this.assertCanViewBooking(response, requesterId, requesterRole);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  private async assertCanViewBooking(
    booking: BookingResponseDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<void> {
    if (requesterRole === Role.ADMIN) {
      return;
    }

    if (requesterRole === Role.USER) {
      if (booking.userId !== requesterId) {
        throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
      }
      return;
    }

    if (requesterRole === Role.AGENT) {
      const hotel = await this.hotelService.getHotelById(booking.hotelId);
      if (!hotel || hotel.ownerId !== requesterId) {
        throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
      }
      return;
    }

    throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
  }

  async getUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const cacheKey = REDIS_KEYS.USER_BOOKINGS(userId);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as BookingResponseDto[];
    }

    const bookings = await this.readRepo.findMany({ userId });
    const response = BookingMapper.toResponseDtoList(bookings);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  async getAllBookings(): Promise<BookingResponseDto[]> {
    const bookings = await this.readRepo.findMany();
    return BookingMapper.toResponseDtoList(bookings);
  }

  async getHotelBookings(
    hotelId: string,
    agentId: string,
  ): Promise<BookingResponseDto[]> {
    const hotel = await this.hotelService.getHotelById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }
    if (agentId !== hotel.ownerId) {
      throw new ForbiddenError("Bạn không có quyền truy cập vào khách sạn này");
    }

    const cacheKey = REDIS_KEYS.HOTEL_BOOKINGS(hotelId);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as BookingResponseDto[];
    }

    const bookings = await this.readRepo.findMany({ hotelId });
    const response = BookingMapper.toResponseDtoList(bookings);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  async updateBookingStatus(
    id: string,
    requesterId: string,
    requesterRole: string,
    status: BookingStatus,
    roomIds?: string[]
  ): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
    }

    const hotel = await this.hotelService.getHotelById(booking.hotelId);
    if (!hotel) {
      throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
    }
    if (requesterRole !== Role.ADMIN && hotel.ownerId !== requesterId) {
      throw new ForbiddenError(
        "Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.",
      );
    }

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED],
      [BookingStatus.CHECKED_IN]: [BookingStatus.COMPLETED],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.COMPLETED]: [],
    };
    if (!allowedTransitions[booking.status].includes(status)) {
      throw new BadRequestError(
        `Không thể chuyển booking từ ${booking.status} sang ${status}.`,
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. If roomIds provided, validate and update BookingRoom
      if (roomIds && roomIds.length > 0) {
        if (roomIds.length !== booking.quantity) {
          throw new BadRequestError(`Số lượng phòng cung cấp (${roomIds.length}) không khớp với số lượng khách đặt (${booking.quantity}).`);
        }

        // Validate that rooms belong to correct roomType and are active
        const validRooms = await tx.room.findMany({
          where: {
            id: { in: roomIds },
            roomTypeId: booking.roomTypeId,
            isActive: true
          }
        });

        if (validRooms.length !== roomIds.length) {
          throw new BadRequestError("Một hoặc nhiều phòng không hợp lệ, không thuộc loại phòng này hoặc đã bị khóa.");
        }

        // Validate that rooms are not already assigned to overlapping bookings
        const overlappingBookings = await tx.bookingRoom.findMany({
          where: {
            roomId: { in: roomIds },
            bookingId: { not: id }, // Exclude current booking if any
            booking: {
              status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN] },
              NOT: {
                OR: [
                  { checkOutDate: { lte: booking.checkInDate } },
                  { checkInDate: { gte: booking.checkOutDate } },
                ],
              },
            },
          }
        });

        if (overlappingBookings.length > 0) {
          throw new BadRequestError("Một hoặc nhiều phòng đã được gán cho khách khác trong khoảng thời gian này.");
        }

        // Clear existing rooms
        await tx.bookingRoom.deleteMany({
          where: { bookingId: id }
        });
        
        // Add new rooms
        await tx.bookingRoom.createMany({
          data: roomIds.map(roomId => ({ bookingId: id, roomId }))
        });
      }

      const assignedRooms = await tx.bookingRoom.findMany({
        where: { bookingId: id },
        select: { roomId: true },
      });
      const assignedRoomIds = assignedRooms.map((br) => br.roomId);

      if (status === BookingStatus.CHECKED_IN) {
        if (assignedRoomIds.length !== booking.quantity) {
          throw new BadRequestError(`Phải gán đủ ${booking.quantity} phòng trước khi cho khách check-in.`);
        }
        
        await tx.room.updateMany({
          where: { id: { in: assignedRoomIds } },
          data: { status: RoomStatus.OCCUPIED },
        });
      } else if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
        if (assignedRoomIds.length > 0) {
          await tx.room.updateMany({
            where: { id: { in: assignedRoomIds } },
            data: { status: RoomStatus.AVAILABLE },
          });
        }
      }

      // Update booking status
      await tx.booking.update({
        where: { id },
        data: { status },
      });
    });

    const updated = await this.readRepo.findById(id);
    if (!updated) throw new NotFoundError("Booking not found after update");
    
    await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
    return BookingMapper.toResponseDto(updated);
  }

  async updatePaymentStatus(
    id: string,
    requesterId: string,
    requesterRole: string,
    paymentStatus: PaymentStatus,
  ): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
    }

    const hotel = await this.hotelService.getHotelById(booking.hotelId);
    if (!hotel) {
      throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
    }
    if (requesterRole !== Role.ADMIN && hotel.ownerId !== requesterId) {
      throw new ForbiddenError(
        "Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.",
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      let currentStatus = booking.status;
      
      if (paymentStatus === PaymentStatus.PAID) {
        currentStatus = BookingStatus.CONFIRMED;
        
        // Find assigned rooms and update to OCCUPIED
        const assignedRooms = await tx.bookingRoom.findMany({
          where: { bookingId: id },
          select: { roomId: true },
        });
        const roomIds = assignedRooms.map(br => br.roomId);

        if (roomIds.length > 0) {
          await tx.room.updateMany({
            where: { id: { in: roomIds } },
            data: { status: RoomStatus.OCCUPIED },
          });
        }
      }

      return tx.booking.update({
        where: { id },
        data: {
          status: currentStatus,
          paymentStatus,
          paymentDate: paymentStatus === PaymentStatus.PAID ? new Date() : null,
        }
      });
    });

    await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
    return BookingMapper.toResponseDto(updated);
  }

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
    }
    if (booking.userId !== userId) {
      throw new ForbiddenError("Bạn không có quyền hủy đơn đặt phòng này.");
    }
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestError("Không thể hủy đơn đặt phòng ở trạng thái này.");
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Find assigned rooms and update to AVAILABLE if they were OCCUPIED
      const assignedRooms = await tx.bookingRoom.findMany({
        where: { bookingId: id },
        select: { roomId: true },
      });
      const roomIds = assignedRooms.map(br => br.roomId);

      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: RoomStatus.AVAILABLE },
        });
      }

      return tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      });
    });
    await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
    return BookingMapper.toResponseDto(updated);
  }

  async handlePaymentCallback(
    bookingId: string,
    amount: number,
    transactionId: string,
  ): Promise<{ rspCode: string; message: string }> {
    const booking = await this.readRepo.findById(bookingId);
    if (!booking) {
      return { rspCode: "01", message: "Order not found" };
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      return { rspCode: "02", message: "Order already confirmed" };
    }
    if (Number(booking.totalAmount) !== amount) {
      return { rspCode: "04", message: "Invalid amount" };
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Find assigned rooms for this booking
      const assignedRooms = await tx.bookingRoom.findMany({
        where: { bookingId },
        select: { roomId: true },
      });
      const roomIds = assignedRooms.map(br => br.roomId);

      if (roomIds.length > 0) {
        // Update Room Status to OCCUPIED
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: RoomStatus.OCCUPIED },
        });
      }

      // Update Booking
      return tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          paymentDate: new Date(),
          transactionId,
        },
      });
    });

    await this.bookingPostProcess.execute(updated);
    return { rspCode: "00", message: "Confirm Success" };
  }
}
