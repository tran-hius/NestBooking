import { BookingStatus, PaymentMethod, PaymentStatus, PrismaClient, Role } from "#generated/prisma";
import { IBookingReadRepository } from "../interfaces/IBookingReadRepository";
import { IBookingWriteRepository } from "../interfaces/IBookingWriteRepository";
import { BookingResponseDto, CreateBookingDto } from "../dtos/BookingDTO";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import crypto from "crypto";

import { BookingMapper } from "../mapper/BookingMapper";
import { IHotelService } from "@/modules/hotel/interfaces/IHotelService";
import { IRoomTypeService } from "@/modules/hotel/interfaces/IRoomTypeService";
import { IRoomService } from "@/modules/hotel/interfaces/IRoomService";
import { IBookingStatisticsRepository } from "../interfaces/IBookingStatisticsRepository";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import { VnpayService } from "../../payment/services/VnpayService";

export class BookingService {
  private vnpayService: VnpayService;
  
  constructor(
    private readonly readRepo: IBookingReadRepository,
    private readonly writeRepo: IBookingWriteRepository,
    private readonly statsRepo: IBookingStatisticsRepository,
    private readonly hotelService: IHotelService,
    private readonly roomTypeService: IRoomTypeService,
    private readonly roomService: IRoomService,
  ) {
    this.vnpayService = new VnpayService();
  }

  async createBooking(
    userId: string,
    data: CreateBookingDto,
    ipAddr: string = "127.0.0.1"
  ): Promise<BookingResponseDto> {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestError(
        "Lß╗ùi: Ng├áy Check-in kh├┤ng ─æ╞░ß╗úc nß║▒m trong qu├í khß╗⌐.",
      );
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      throw new BadRequestError("Ng├áy trß║ú ph├▓ng phß║úi sau ng├áy nhß║¡n ph├▓ng.");
    }

    const roomType = await this.roomTypeService.getRoomTypeById(data.roomTypeId);

    if (!roomType || !roomType.isActive) {
      throw new NotFoundError(
        "Kh├┤ng t├¼m thß║Ñy loß║íi ph├▓ng n├áy hoß║╖c ph├▓ng ─æang bß╗ï tß║ím kh├│a.",
      );
    }

    const totalPhysicalRooms = (await this.roomService.getRoomsByRoomType(data.roomTypeId)).filter(r => r.isActive).length;

    const bookedRoomsCount = await this.readRepo.getOverlappingBookingsCount(
      data.roomTypeId,
      checkIn,
      checkOut,
    );

    const availableRooms = totalPhysicalRooms - bookedRoomsCount;
    if (availableRooms < data.quantity) {
      throw new BadRequestError(
        `Rß║Ñt tiß║┐c! Chß╗ë c├▓n lß║íi ${availableRooms} ph├▓ng trß╗æng trong khoß║úng thß╗¥i gian bß║ín chß╗ìn.`,
      );
    }

    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
    const bookingCode = `BKG-${timestampPart}-${randomPart}`;

    const totalAmount = Number(roomType.price) * nights * data.quantity;

    const paymentMethod = data.paymentMethod || PaymentMethod.PAY_AT_HOTEL;
    
    const initialStatus = paymentMethod === PaymentMethod.PAY_AT_HOTEL 
      ? BookingStatus.CONFIRMED 
      : BookingStatus.PENDING;

    const newBooking = await this.writeRepo.create({
      bookingCode: bookingCode,
      userId,
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      quantity: data.quantity,
      totalAmount,
      status: initialStatus,
      paymentMethod: paymentMethod,
      paymentStatus: PaymentStatus.UNPAID,
      paymentDate: null,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail,
      specialRequests: data.specialRequests,
    });

    let paymentUrl = undefined;

    if (paymentMethod === PaymentMethod.VNPAY) {
      const orderInfo = `Thanh toan dat phong ${bookingCode}`;
      paymentUrl = this.vnpayService.createPaymentUrl(ipAddr, totalAmount, orderInfo, newBooking.id);
    }

    if (initialStatus === BookingStatus.CONFIRMED) {
      import("@/modules/auth/services/emailService").then(({ EmailService }) => {
        import("@/config/transporter").then(({ Transporter }) => {
          const emailService = new EmailService(Transporter.transporter);
          emailService.sendBookingSuccessEmail(
            newBooking.guestEmail, 
            newBooking.bookingCode, 
            newBooking.checkInDate.toISOString(), 
            newBooking.checkOutDate.toISOString()
          ).catch(err => console.error("Error sending booking email:", err));
        });
      });
    }

    await this.clearBookingCache(newBooking.id, newBooking.userId, newBooking.hotelId);

    const response = BookingMapper.toResponseDto(newBooking);
    response.paymentUrl = paymentUrl;
    
    return response;
  }

  private async clearBookingCache(bookingId: string, userId: string, hotelId: string) {
    const keys = [
      REDIS_KEYS.BOOKING(bookingId),
      REDIS_KEYS.USER_BOOKINGS(userId),
      REDIS_KEYS.HOTEL_BOOKINGS(hotelId),
    ];
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
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
        throw new ForbiddenError("Bß║ín kh├┤ng c├│ quyß╗ün xem ─æ╞ín ─æß║╖t ph├▓ng n├áy");
      }
      return booking;
    }

    const booking = await this.readRepo.findById(id);

    if (!booking) {
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy ─æ╞ín ─æß║╖t ph├▓ng");
    }

    if (requestRole === Role.USER && booking.userId !== requestId) {
      throw new ForbiddenError("Bß║ín kh├┤ng c├│ quyß╗ün xem ─æ╞ín ─æß║╖t ph├▓ng n├áy");
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
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy kh├ích sß║ín.");
    }

    if (agentId !== hotel?.ownerId) {
      throw new ForbiddenError("Bß║ín kh├┤ng c├│ quyß╗ün truy cß║¡p v├áo kh├ích sß║ín n├áy");
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
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy ─æ╞ín ─æß║╖t ph├▓ng.");
    }

    const hotel = await this.hotelService.getHotelById(booking.hotelId);

    if (!hotel) {
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy dß╗» liß╗çu kh├ích sß║ín cß╗ºa ─æ╞ín n├áy.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bß║ín kh├┤ng c├│ quyß╗ün cß║¡p nhß║¡t trß║íng th├íi ─æ╞ín ─æß║╖t ph├▓ng cß╗ºa kh├ích sß║ín n├áy.",
      );
    }

    const updated = await this.writeRepo.update(id, { status });
    await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
    return BookingMapper.toResponseDto(updated);
  }

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);
    if (!booking) {
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy ─æ╞ín ─æß║╖t ph├▓ng.");
    }
    if (booking.userId !== userId) {
      throw new ForbiddenError("Bß║ín kh├┤ng c├│ quyß╗ün hß╗ºy ─æ╞ín ─æß║╖t ph├▓ng n├áy.");
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError(
        "Kh├┤ng thß╗â hß╗ºy ─æ╞ín ─æß║╖t ph├▓ng ß╗ƒ trß║íng th├íi n├áy.",
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

  async getHotelRevenue(
    hotelId: string,
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const hotel = await this.hotelService.getHotelById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy kh├ích sß║ín.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bß║ín kh├┤ng c├│ quyß╗ün xem doanh thu cß╗ºa kh├ích sß║ín n├áy.",
      );
    }

    return this.statsRepo.revenue(hotelId, startDate, endDate);
  }

  async getHotelOccupancy(
    hotelId: string,
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const hotel = await this.hotelService.getHotelById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Kh├┤ng t├¼m thß║Ñy kh├ích sß║ín.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bß║ín kh├┤ng c├│ quyß╗ün xem c├┤ng suß║Ñt ph├▓ng cß╗ºa kh├ích sß║ín n├áy.",
      );
    }

    return this.statsRepo.occupancy(hotelId, startDate, endDate);
  }

}


