import { BookingStatus, PrismaClient, Role } from "generated/prisma";
import { IBookingReadRepository } from "../interfaces/IBookingReadRepository";
import { IBookingWriteRepository } from "../interfaces/IBookingWriteRepository";
import { BookingResponseDto, CreateBookingDto } from "../dtos/BookingDTO";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import crypto from "crypto";
import { EXCHANGES, rabbitmq, ROUTING_KEYS } from "@/infrastructure/rabbitmq";
import { BookingMapper } from "../mapper/BookingMapper";
import { IRoomTypeRepository } from "@/modules/hotel/interfaces/IRoomTypeRepository";
import { IBookingStatisticsRepository } from "../interfaces/IBookingStatisticsRepository";
import { IRoomRepository } from "@/modules/hotel/interfaces/IRoomRepository";
import { IHotelRepository } from "@/modules/hotel/interfaces/IHotelRepository";

export class BookingService {
  constructor(
    private readonly readRepo: IBookingReadRepository,
    private readonly writeRepo: IBookingWriteRepository,
    private readonly statsRepo: IBookingStatisticsRepository,
    private readonly prisma: PrismaClient,
    private readonly hotelRepo: IHotelRepository,

    private readonly roomType: IRoomTypeRepository,
    private readonly roomRepo: IRoomRepository,
  ) {}

  async createBooking(
    userId: string,
    data: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestError(
        "Lỗi: Ngày Check-in không được nằm trong quá khứ.",
      );
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      throw new BadRequestError("Ngày trả phòng phải sau ngày nhận phòng.");
    }

    const roomType = await this.roomType.findById(data.roomTypeId);

    if (!roomType || !roomType.isActive) {
      throw new NotFoundError(
        "Không tìm thấy loại phòng này hoặc phòng đang bị tạm khóa.",
      );
    }

    const totalPhysicalRooms = await this.roomRepo.count({
      roomTypeId: data.roomTypeId,
      isActive: true,
    });

    const bookedRoomsCount = await this.readRepo.getOverlappingBookingsCount(
      data.roomTypeId,
      checkIn,
      checkOut,
    );

    const availableRooms = totalPhysicalRooms - bookedRoomsCount;
    if (availableRooms < data.quantity) {
      throw new BadRequestError(
        `Rất tiếc! Chỉ còn lại ${availableRooms} phòng trống trong khoảng thời gian bạn chọn.`,
      );
    }

    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
    const bookingCode = `BKG-${timestampPart}-${randomPart}`;

    const totalAmount = Number(roomType.price) * nights * data.quantity;

    const newBooking = await this.writeRepo.create({
      bookingCode: bookingCode,
      userId,
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      quantity: data.quantity,
      totalAmount,
      status: BookingStatus.PENDING,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail,
      specialRequests: data.specialRequests,
    });

    await rabbitmq.publishToExchange(
      EXCHANGES.BOOKING,
      ROUTING_KEYS.BOOKING_CREATE,
      { bookingId: newBooking.id },
    );

    return BookingMapper.toResponseDto(newBooking);
  }

  async getBookingById(
    id: string,
    requestId: string,
    requestRole: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.readRepo.findById(id);

    if (!booking) {
      throw new NotFoundError("Không tìm thấy đơn đặt phòng");
    }

    if (requestRole === Role.USER && booking.userId !== requestId) {
      throw new ForbiddenError("Bạn không có quyền xem đơn đặt phòng này");
    }

    return BookingMapper.toResponseDto(booking);
  }

  async getUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.readRepo.findMany({ userId });
    return BookingMapper.toResponseDtoList(bookings);
  }

  async getHotelBookings(
    hotelId: string,
    agentId: string,
  ): Promise<BookingResponseDto[]> {
    // TODO: Verify agentId owns hotelId (Cần kiểm tra Agent này có sở hữu Khách sạn này không)
    const hotel = await this.hotelRepo.findById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }

    if (agentId !== hotel?.ownerId) {
      throw new ForbiddenError("Bạn không có quyền truy cập vào khách sạn này");
    }

    const bookings = await this.readRepo.findMany({ hotelId });

    return BookingMapper.toResponseDtoList(bookings);
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

    const hotel = await this.hotelRepo.findById(booking.hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.",
      );
    }

    // TODO: Verify agentId owns hotelId (Đảm bảo chỉ chủ khách sạn mới được đổi trạng thái đơn)
    const updated = await this.writeRepo.update(id, { status });
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

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestError(
        "Chỉ có thể hủy đơn đặt phòng đang ở trạng thái chờ xử lý.",
      );
    }

    const updated = await this.writeRepo.update(id, {
      status: BookingStatus.CANCELLED,
    });
    return BookingMapper.toResponseDto(updated);
  }

  async getHotelRevenue(
    hotelId: string,
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const hotel = await this.hotelRepo.findById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bạn không có quyền xem doanh thu của khách sạn này.",
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
    const hotel = await this.hotelRepo.findById(hotelId);

    if (!hotel) {
      throw new NotFoundError("Không tìm thấy khách sạn.");
    }

    if (hotel.ownerId !== agentId) {
      throw new ForbiddenError(
        "Bạn không có quyền xem công suất phòng của khách sạn này.",
      );
    }

    return this.statsRepo.occupancy(hotelId, startDate, endDate);
  }

  // searchBookings();
  // getBookingByCode();
  // getBookingHistory();
  // getPendingBookings();
  // getConfirmedBookings();
  // getCancelledBookings();
}


