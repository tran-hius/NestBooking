import { PaymentStatus, BookingStatus } from "../../../../generated/prisma/index.js";
import logger from "../../../config/logger.js";
import { redisClient, REDIS_KEYS } from "../../../infrastructure/redis/index.js";
export class PaymentController {
    vnpayService;
    bookingReadRepo;
    bookingWriteRepo;
    constructor(vnpayService, bookingReadRepo, bookingWriteRepo) {
        this.vnpayService = vnpayService;
        this.bookingReadRepo = bookingReadRepo;
        this.bookingWriteRepo = bookingWriteRepo;
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
    vnpayIpn = async (req, res) => {
        logger.info("[PaymentController] VNPay IPN Webhook received", { query: req.query });
        try {
            const vnpParams = req.query;
            const result = this.vnpayService.verifyIpn(vnpParams);
            if (!result.isSuccess) {
                res.status(200).json({ RspCode: result.responseCode, Message: result.message });
                return;
            }
            const bookingId = result.orderId;
            const booking = await this.bookingReadRepo.findById(bookingId);
            if (!booking) {
                res.status(200).json({ RspCode: "01", Message: "Order not found" });
                return;
            }
            if (booking.paymentStatus === PaymentStatus.PAID) {
                res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
                return;
            }
            const vnpAmount = Number(vnpParams['vnp_Amount']) / 100;
            if (Number(booking.totalAmount) !== vnpAmount) {
                res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
                return;
            }
            const transactionId = vnpParams['vnp_TransactionNo'];
            // Cập nhật trạng thái
            const updatedBooking = await this.bookingWriteRepo.update(bookingId, {
                status: BookingStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentDate: new Date(),
                transactionId: transactionId
            });
            // Gửi email
            import("../../../modules/auth/services/emailService.js").then(({ EmailService }) => {
                import("../../../config/transporter.js").then(({ Transporter }) => {
                    const emailService = new EmailService(Transporter.transporter);
                    emailService.sendBookingSuccessEmail(updatedBooking.guestEmail, updatedBooking.bookingCode, updatedBooking.checkInDate.toISOString(), updatedBooking.checkOutDate.toISOString()).catch(err => console.error("Error sending booking email:", err));
                });
            });
            await this.clearBookingCache(updatedBooking.id, updatedBooking.userId, updatedBooking.hotelId);
            res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        }
        catch (error) {
            logger.error("[PaymentController] VNPAY IPN ERROR:", error);
            res.status(200).json({ RspCode: "99", Message: "Unknown error" });
        }
    };
}
