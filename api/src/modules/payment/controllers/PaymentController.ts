import { Request, Response } from "express";
import { VnpayService } from "../services/VnpayService";
import { IBookingReadRepository } from "../../booking/interfaces/IBookingReadRepository";
import { IBookingWriteRepository } from "../../booking/interfaces/IBookingWriteRepository";
import { PaymentStatus, BookingStatus } from "../../../../generated/prisma";
import logger from "@/config/logger";
import { redisClient, REDIS_KEYS } from "@/infrastructure/redis";

export class PaymentController {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly bookingReadRepo: IBookingReadRepository,
    private readonly bookingWriteRepo: IBookingWriteRepository
  ) {}

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

  public vnpayIpn = async (req: Request, res: Response): Promise<void> => {
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

      const transactionId = vnpParams['vnp_TransactionNo'] as string;

      // Cập nhật trạng thái
      const updatedBooking = await this.bookingWriteRepo.update(bookingId, {
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        paymentDate: new Date(),
        transactionId: transactionId
      });

      // Gửi email
      import("@/modules/auth/services/emailService").then(({ EmailService }) => {
        import("@/config/transporter").then(({ Transporter }) => {
          const emailService = new EmailService(Transporter.transporter);
          emailService.sendBookingSuccessEmail(
            updatedBooking.guestEmail, 
            updatedBooking.bookingCode, 
            updatedBooking.checkInDate.toISOString(), 
            updatedBooking.checkOutDate.toISOString()
          ).catch(err => console.error("Error sending booking email:", err));
        });
      });

      await this.clearBookingCache(updatedBooking.id, updatedBooking.userId, updatedBooking.hotelId);

      res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } catch (error) {
      logger.error("[PaymentController] VNPAY IPN ERROR:", error);
      res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  };
}
