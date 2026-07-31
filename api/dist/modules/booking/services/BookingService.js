import { BookingStatus, PaymentStatus, Role } from "#generated/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../utils/errors/index.js";
import { BookingMapper } from "../mapper/bookingMapper.js";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "../../../infrastructure/redis/index.js";
export class BookingService {
    readRepo;
    writeRepo;
    hotelService;
    bookingCreationService;
    bookingPostProcess;
    constructor(readRepo, writeRepo, hotelService, bookingCreationService, bookingPostProcess) {
        this.readRepo = readRepo;
        this.writeRepo = writeRepo;
        this.hotelService = hotelService;
        this.bookingCreationService = bookingCreationService;
        this.bookingPostProcess = bookingPostProcess;
    }
    async createBooking(userId, data, ipAddr = "127.0.0.1") {
        return this.bookingCreationService.createBooking(userId, data, ipAddr);
    }
    async clearBookingCache(bookingId, userId, hotelId) {
        await redisClient.del(REDIS_KEYS.BOOKING(bookingId), REDIS_KEYS.USER_BOOKINGS(userId), REDIS_KEYS.HOTEL_BOOKINGS(hotelId));
    }
    async getBookingById(id, requesterId, requesterRole) {
        const cacheKey = REDIS_KEYS.BOOKING(id);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            const booking = JSON.parse(cached);
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
    async assertCanViewBooking(booking, requesterId, requesterRole) {
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
    async getUserBookings(userId) {
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
    async getAllBookings() {
        const bookings = await this.readRepo.findMany();
        return BookingMapper.toResponseDtoList(bookings);
    }
    async getHotelBookings(hotelId, agentId) {
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
            return JSON.parse(cached);
        }
        const bookings = await this.readRepo.findMany({ hotelId });
        const response = BookingMapper.toResponseDtoList(bookings);
        await redisClient.setex(cacheKey, REDIS_TTL.BOOKING, JSON.stringify(response));
        return response;
    }
    async updateBookingStatus(id, requesterId, requesterRole, status) {
        const booking = await this.readRepo.findById(id);
        if (!booking) {
            throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
        }
        const hotel = await this.hotelService.getHotelById(booking.hotelId);
        if (!hotel) {
            throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
        }
        if (requesterRole !== Role.ADMIN && hotel.ownerId !== requesterId) {
            throw new ForbiddenError("Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.");
        }
        const allowedTransitions = {
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
            [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
            [BookingStatus.CANCELLED]: [],
            [BookingStatus.COMPLETED]: [],
        };
        if (!allowedTransitions[booking.status].includes(status)) {
            throw new BadRequestError(`Không thể chuyển booking từ ${booking.status} sang ${status}.`);
        }
        const updated = await this.writeRepo.update(id, { status });
        await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
        return BookingMapper.toResponseDto(updated);
    }
    async cancelBooking(id, userId) {
        const booking = await this.readRepo.findById(id);
        if (!booking) {
            throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
        }
        if (booking.userId !== userId) {
            throw new ForbiddenError("Bạn không có quyền hủy đơn đặt phòng này.");
        }
        if (booking.status === BookingStatus.CANCELLED ||
            booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestError("Không thể hủy đơn đặt phòng ở trạng thái này.");
        }
        const updated = await this.writeRepo.update(id, {
            status: BookingStatus.CANCELLED,
        });
        await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
        return BookingMapper.toResponseDto(updated);
    }
    async handlePaymentCallback(bookingId, amount, transactionId) {
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
