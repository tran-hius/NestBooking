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

export class BookingService implements IBookingService {
  constructor(
    private readonly readRepo: IBookingReadRepository,
    private readonly writeRepo: IBookingWriteRepository,
    private readonly hotelService: IHotelService,
    private readonly bookingCreationService: IBookingCreationService,
    private readonly bookingPostProcess: BookingPostProcess,
  ) {}

  async createBooking(
    userId: string,
    data: CreateBookingDto,
    ipAddr: string = "127.0.0.1",
  ): Promise<BookingResponseDto> {
    return this.bookingCreationService.createBooking(userId, data, ipAddr);
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
      [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.COMPLETED]: [],
    };
    if (!allowedTransitions[booking.status].includes(status)) {
      throw new BadRequestError(
        `Không thể chuyển booking từ ${booking.status} sang ${status}.`,
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
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestError("Không thể hủy đơn đặt phòng ở trạng thái này.");
    }

    const updated = await this.writeRepo.update(id, {
      status: BookingStatus.CANCELLED,
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

    const updated = await this.writeRepo.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentDate: new Date(),
      transactionId,
    });
    await this.bookingPostProcess.execute(updated);
    return { rspCode: "00", message: "Confirm Success" };
  }
}
