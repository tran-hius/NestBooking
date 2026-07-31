import { VnpayService } from "./vnpayService";
import { IBookingService } from "../../booking/interfaces/iBookingService";
import logger from "@/config/logger";

export class PaymentCallbackService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly bookingService: IBookingService
  ) {}

  public async processVnpayIpn(vnpParams: any): Promise<{ rspCode: string; message: string }> {
    logger.info("[PaymentCallbackService] VNPay IPN Webhook received", { query: vnpParams });
    
    try {
      const result = this.vnpayService.verifyIpn(vnpParams);
      
      if (!result.isSuccess) {
        return { rspCode: result.responseCode, message: result.message };
      }

      const bookingId = result.orderId;
      const vnpAmount = result.amount;
      const transactionId = result.transactionId;
      if (!transactionId) {
        return { rspCode: "99", message: "Missing transaction number" };
      }

      const processResult = await this.bookingService.handlePaymentCallback(bookingId, vnpAmount, transactionId);

      return { rspCode: processResult.rspCode, message: processResult.message };
    } catch (error) {
      logger.error("[PaymentCallbackService] VNPAY IPN ERROR:", error);
      return { rspCode: "99", message: "Unknown error" };
    }
  }

  public async processVnpayReturn(vnpParams: Record<string, unknown>): Promise<{
    status: "success" | "failed";
    bookingId?: string;
    responseCode: string;
    message: string;
  }> {
    const result = this.vnpayService.verifyIpn(vnpParams);
    if (!result.isSuccess) {
      return {
        status: "failed",
        bookingId: result.orderId || undefined,
        responseCode: result.responseCode,
        message: result.message,
      };
    }

    if (!result.transactionId) {
      return { status: "failed", bookingId: result.orderId, responseCode: "99", message: "Missing transaction number" };
    }

    const processed = await this.bookingService.handlePaymentCallback(
      result.orderId,
      result.amount,
      result.transactionId,
    );
    const success = processed.rspCode === "00" || processed.rspCode === "02";
    return {
      status: success ? "success" : "failed",
      bookingId: result.orderId,
      responseCode: processed.rspCode,
      message: processed.message,
    };
  }
}
