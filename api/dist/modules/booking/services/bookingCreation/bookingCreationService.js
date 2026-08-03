import { NotificationType } from "#generated/prisma";
import { BookingMapper } from "../../mapper/bookingMapper";
import crypto from "crypto";
import { prisma } from "@/config/prisma";
import { BadRequestError } from "@/utils/errors";
import logger from "@/config/logger";
export class BookingCreationService {
    availabilityService;
    bookingWriteRepo;
    bookingPayment;
    bookingPostProcess;
    bookingLockService;
    constructor(availabilityService, bookingWriteRepo, bookingPayment, bookingPostProcess, bookingLockService) {
        this.availabilityService = availabilityService;
        this.bookingWriteRepo = bookingWriteRepo;
        this.bookingPayment = bookingPayment;
        this.bookingPostProcess = bookingPostProcess;
        this.bookingLockService = bookingLockService;
    }
    async createBooking(userId, data, ipAddr = "127.0.0.1") {
        const { checkIn, checkOut, nights } = this.validateAndParseDates(data.checkInDate, data.checkOutDate);
        // Acquire Distributed Lock
        const lockValue = await this.bookingLockService.acquireLockWithRetry(data.roomTypeId);
        if (!lockValue) {
            throw new BadRequestError("Hệ thống đang quá tải cho loại phòng này, vui lòng thử lại sau giây lát.");
        }
        let booking;
        try {
            booking = await prisma.$transaction(async (tx) => {
                return this.executeBookingTransaction(userId, data, checkIn, checkOut, nights, tx);
            });
        }
        finally {
            await this.bookingLockService.releaseLock(data.roomTypeId, lockValue);
        }
        const paymentUrl = this.generatePaymentUrlSafe(booking, ipAddr);
        await this.bookingPostProcess.execute(booking);
        const response = BookingMapper.toResponseDto(booking);
        if (paymentUrl) {
            response.paymentUrl = paymentUrl;
        }
        return response;
    }
    validateAndParseDates(checkInStr, checkOutStr) {
        const checkIn = new Date(checkInStr);
        const checkOut = new Date(checkOutStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
            throw new BadRequestError("Ngày Check-in không được nằm trong quá khứ.");
        }
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return { checkIn, checkOut, nights };
    }
    async executeBookingTransaction(userId, data, checkIn, checkOut, nights, tx) {
        const roomType = await this.availabilityService.validateAvailability(data.roomTypeId, data.quantity, checkIn, checkOut, tx);
        if (roomType.hotelId !== data.hotelId) {
            throw new BadRequestError("Loại phòng không thuộc khách sạn đã chọn.");
        }
        const bookingCode = `BKG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const totalAmount = Number(roomType.price) * nights * data.quantity;
        if (totalAmount <= 0) {
            throw new BadRequestError("Tổng tiền đặt phòng không hợp lệ.");
        }
        const paymentDetails = this.bookingPayment.determineStatus(data.paymentMethod);
        const booking = await this.bookingWriteRepo.create({
            bookingCode,
            userId,
            hotelId: data.hotelId,
            roomTypeId: data.roomTypeId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            quantity: data.quantity,
            totalAmount,
            status: paymentDetails.bookingStatus,
            paymentMethod: paymentDetails.paymentMethod,
            paymentStatus: paymentDetails.paymentStatus,
            paymentDate: null,
            guestName: data.guestName,
            guestPhone: data.guestPhone,
            guestEmail: data.guestEmail,
            specialRequests: data.specialRequests,
        }, tx);
        const hotel = await tx.hotel.findUnique({
            where: { id: data.hotelId },
            select: { name: true, ownerId: true },
        });
        if (!hotel) {
            throw new BadRequestError("Khách sạn không tồn tại.");
        }
        const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Ho_Chi_Minh",
        });
        await tx.notification.create({
            data: {
                userId: hotel.ownerId,
                title: "Có đặt phòng mới",
                message: `${data.guestName} vừa đặt ${data.quantity} phòng ${roomType.name} tại ${hotel.name}, từ ${dateFormatter.format(checkIn)} đến ${dateFormatter.format(checkOut)}. Mã đặt phòng: ${bookingCode}.`,
                type: NotificationType.BOOKING_SUCCESS,
            },
        });
        return booking;
    }
    generatePaymentUrlSafe(booking, ipAddr) {
        try {
            return this.bookingPayment.generatePaymentUrl(booking.paymentMethod, Number(booking.totalAmount), booking.bookingCode, booking.id, ipAddr);
        }
        catch (error) {
            logger.error(`Error generating payment URL for booking ${booking.id}: ${error}`);
            return undefined;
        }
    }
}
