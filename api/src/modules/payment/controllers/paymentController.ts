import { Request, Response } from "express";
import { PaymentCallbackService } from "../services/paymentCallbackService";
import { env } from "@/config/env";

export class PaymentController {
  constructor(
    private readonly paymentCallbackService: PaymentCallbackService,
    private readonly vnpayService: import("../services/vnpayService").VnpayService,
    private readonly bookingService: import("../../booking/interfaces/iBookingService").IBookingService
  ) {}

  public generatePaymentUrl = async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.bookingId as string;
    const booking = await this.bookingService.getBookingById(bookingId, req.user?.userId as string, req.user?.role as string);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    const ipAddrRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ipAddr = Array.isArray(ipAddrRaw) ? ipAddrRaw[0] : ipAddrRaw;
    const paymentUrl = this.vnpayService.createPaymentUrl(
      ipAddr as string,
      booking.totalAmount,
      `Thanh toan dat phong ${booking.bookingCode}`,
      booking.id
    );
    res.status(200).json({ paymentUrl });
  };

  public vnpayIpn = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentCallbackService.processVnpayIpn(req.query);
    res.status(200).json({ RspCode: result.rspCode, Message: result.message });
  };

  public vnpayReturn = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentCallbackService.processVnpayReturn(req.query);
    const params = new URLSearchParams({
      status: result.status,
      code: result.responseCode,
      message: result.message,
    });
    if (result.bookingId) params.set("bookingId", result.bookingId);
    res.redirect(`${env.CLIENT_URL}/payment/result?${params.toString()}`);
  };
}
