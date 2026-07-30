import { BookingStatus, PaymentMethod, PaymentStatus, PrismaClient, Role } from "#generated/prisma";
import { IBookingReadRepository } from "../interfaces/iBookingReadRepository";
import { IBookingWriteRepository } from "../interfaces/iBookingWriteRepository";
import { BookingResponseDto, CreateBookingDto } from "../dtos/bookingDTO";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import crypto from "crypto";

import { BookingMapper } from "../mapper/bookingMapper";
import { IHotelService } from "@/modules/hotel/interfaces/iHotelService";
import { IRoomTypeService } from "@/modules/hotel/interfaces/iRoomTypeService";
import { IRoomService } from "@/modules/hotel/interfaces/iRoomService";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import { IBookingService } from "../interfaces/iBookingService";
import { IBookingCreationService } from "../interfaces/iBookingCreationService";
import { BookingCacheHelper } from "../utils/bookingCacheHelper";

export class BookingService implements IBookingService {
  
  constructor(
    private readonly readRepo: IBookingReadRepository,
    private readonly writeRepo: IBookingWriteRepository,
    private readonly hotelService: IHotelService,
    private readonly bookingCreationService: IBookingCreationService
  ) {}

  async createBooking(
    userId: string,
    data: CreateBookingDto,
    ipAddr: string = "127.0.0.1"
  ): Promise<BookingResponseDto> {
    return this.bookingCreationService.createBooking(userId, data, ipAddr);
  }

  public async clearBookingCache(bookingId: string, userId: string, hotelId: string) {
    await BookingCacheHelper.clearBookingCache(bookingId, userId, hotelId);
  }

  async getBookingById(
    id: string,
    requestId: string,
    requestRole: string,
  ): Promise<BookingResponseDto> {
    const cacheKey = REDIS_KEYS.BOOKING(id);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const booking = JSON.parse(cached) as BookingResponseDto;
      if (requestRole === Role.USER && booking.userId !== requestId) {
        throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
      }
      return booking;
    }

    const booking = await this.readRepo.findById(id);

    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng");
    }

    if (requestRole === Role.USER && booking.userId !== requestId) {
      throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
    }

    const response = BookingMapper.toResponseDto(booking);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  async getUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const cacheKey = REDIS_KEYS.USER_BOOKINGS(userId);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const bookings = await this.readRepo.findMany({ userId });
    const response = BookingMapper.toResponseDtoList(bookings);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  async getHotelBookings(
    hotelId: string,
    agentId: string,
  ): Promise<BookingResponseDto[]> {
    const hotel = await this.hotelService.getHotelById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }

    if (agentId !== hotel?.ownerId) {
      throw new ForbiddenError("Bạn không có quyền truy cập vào khách sạn này");
    }

    const cacheKey = REDIS_KEYS.HOTEL_BOOKINGS(hotelId);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const bookings = await this.readRepo.findMany({ hotelId });

    const response = BookingMapper.toResponseDtoList(bookings);
    await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
    return response;
  }

  async updateBookingStatus(
    id: string,
    agentId: string,
    status: BookingStatus,
  ): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
    }

    const hotel = await this.hotelService.getHotelById(booking.hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.",
      );
    }

    const updated = await this.writeRepo.update(id, { status });
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

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError(
        "Không thể hủy đơn đặt phòng ở trạng thái này.",
      );
    }

    const newPaymentStatus = booking.paymentStatus === PaymentStatus.PAID 
      ? PaymentStatus.REFUNDED 
      : booking.paymentStatus;

    const updated = await this.writeRepo.update(id, {
      status: BookingStatus.CANCELLED,
      paymentStatus: newPaymentStatus,
    });
    
    await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
    return BookingMapper.toResponseDto(updated);
  }



  async handlePaymentCallback(bookingId: string, amount: number, transactionId: string): Promise<{ rspCode: string; message: string }> {
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

    const updatedBooking = await this.writeRepo.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentDate: new Date(),
      transactionId: transactionId
    });

    // Clean up cache
    await this.clearBookingCache(updatedBooking.id, updatedBooking.userId, updatedBooking.hotelId);

    // Notify
    import("@/modules/booking/services/bookingCreation/bookingPostProcess").then(({ BookingPostProcess }) => {
      import("@/modules/email/services/emailService").then(({ EmailService }) => {
        import("@/config/transporter").then(({ Transporter }) => {
          const emailService = new EmailService(Transporter.transporter);
          const bookingPostProcess = new BookingPostProcess(emailService);
          bookingPostProcess.execute(updatedBooking).catch(err => console.error(err));
        });
      });
    });

    return { rspCode: "00", message: "Confirm Success" };
  }
}


