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
      const vnpAmount = Number(vnpParams['vnp_Amount']) / 100;
      const transactionId = vnpParams['vnp_TransactionNo'] as string;

      const processResult = await this.bookingService.handlePaymentCallback(bookingId, vnpAmount, transactionId);

      return { rspCode: processResult.rspCode, message: processResult.message };
    } catch (error) {
      logger.error("[PaymentCallbackService] VNPAY IPN ERROR:", error);
      return { rspCode: "99", message: "Unknown error" };
    }
  }
}
