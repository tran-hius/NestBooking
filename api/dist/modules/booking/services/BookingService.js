import { BookingStatus, Role } from "#generated/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import crypto from "crypto";
import { EXCHANGES, rabbitmq, ROUTING_KEYS } from "@/infrastructure/rabbitmq";
import { BookingMapper } from "../mapper/BookingMapper";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
export class BookingService {
    readRepo;
    writeRepo;
    statsRepo;
    hotelService;
    roomTypeService;
    roomService;
    constructor(readRepo, writeRepo, statsRepo, hotelService, roomTypeService, roomService) {
        this.readRepo = readRepo;
        this.writeRepo = writeRepo;
        this.statsRepo = statsRepo;
        this.hotelService = hotelService;
        this.roomTypeService = roomTypeService;
        this.roomService = roomService;
    }
    async createBooking(userId, data) {
        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
            throw new BadRequestError("Lỗi: Ngày Check-in không được nằm trong quá khứ.");
        }
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (nights <= 0) {
            throw new BadRequestError("Ngày trả phòng phải sau ngày nhận phòng.");
        }
        const roomType = await this.roomTypeService.getRoomTypeById(data.roomTypeId);
        if (!roomType || !roomType.isActive) {
            throw new NotFoundError("Không tìm thấy loại phòng này hoặc phòng đang bị tạm khóa.");
        }
        const totalPhysicalRooms = (await this.roomService.getRoomsByRoomType(data.roomTypeId)).filter(r => r.isActive).length;
        const bookedRoomsCount = await this.readRepo.getOverlappingBookingsCount(data.roomTypeId, checkIn, checkOut);
        const availableRooms = totalPhysicalRooms - bookedRoomsCount;
        if (availableRooms < data.quantity) {
            throw new BadRequestError(`Rất tiếc! Chỉ còn lại ${availableRooms} phòng trống trong khoảng thời gian bạn chọn.`);
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
        await rabbitmq.publishToExchange(EXCHANGES.BOOKING, ROUTING_KEYS.BOOKING_CREATE, { bookingId: newBooking.id });
        await this.clearBookingCache(newBooking.id, newBooking.userId, newBooking.hotelId);
        return BookingMapper.toResponseDto(newBooking);
    }
    async clearBookingCache(bookingId, userId, hotelId) {
        const keys = [
            REDIS_KEYS.BOOKING(bookingId),
            REDIS_KEYS.USER_BOOKINGS(userId),
            REDIS_KEYS.HOTEL_BOOKINGS(hotelId),
        ];
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    }
    async getBookingById(id, requestId, requestRole) {
        const cacheKey = REDIS_KEYS.BOOKING(id);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            const booking = JSON.parse(cached);
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
    async getHotelBookings(hotelId, agentId) {
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
    async updateBookingStatus(id, agentId, status) {
        const booking = await this.readRepo.findById(id);
        if (!booking) {
            throw new NotFoundError("Không tìm thấy đơn đặt phòng.");
        }
        const hotel = await this.hotelService.getHotelById(booking.hotelId);
        if (!hotel) {
            throw new NotFoundError("Không tìm thấy dữ liệu khách sạn của đơn này.");
        }
        if (hotel.ownerId !== agentId) {
            throw new ForbiddenError("Bạn không có quyền cập nhật trạng thái đơn đặt phòng của khách sạn này.");
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
        if (booking.status !== BookingStatus.PENDING) {
            throw new BadRequestError("Chỉ có thể hủy đơn đặt phòng đang ở trạng thái chờ xử lý.");
        }
        const updated = await this.writeRepo.update(id, {
            status: BookingStatus.CANCELLED,
        });
        await this.clearBookingCache(updated.id, updated.userId, updated.hotelId);
        return BookingMapper.toResponseDto(updated);
    }
    async getHotelRevenue(hotelId, agentId, startDate, endDate) {
        const hotel = await this.hotelService.getHotelById(hotelId);
        if (!hotel) {
            throw new NotFoundError("Không tìm thấy khách sạn.");
        }
        if (hotel.ownerId !== agentId) {
            throw new ForbiddenError("Bạn không có quyền xem doanh thu của khách sạn này.");
        }
        return this.statsRepo.revenue(hotelId, startDate, endDate);
    }
    async getHotelOccupancy(hotelId, agentId, startDate, endDate) {
        const hotel = await this.hotelService.getHotelById(hotelId);
        if (!hotel) {
            throw new NotFoundError("Không tìm thấy khách sạn.");
        }
        if (hotel.ownerId !== agentId) {
            throw new ForbiddenError("Bạn không có quyền xem công suất phòng của khách sạn này.");
        }
        return this.statsRepo.occupancy(hotelId, startDate, endDate);
    }
}
