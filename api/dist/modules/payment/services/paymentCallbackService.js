import logger from "../../../config/logger.js";
export class PaymentCallbackService {
    vnpayService;
    bookingService;
    constructor(vnpayService, bookingService) {
        this.vnpayService = vnpayService;
        this.bookingService = bookingService;
    }
    async processVnpayIpn(vnpParams) {
        logger.info("[PaymentCallbackService] VNPay IPN Webhook received", { query: vnpParams });
        try {
            const result = this.vnpayService.verifyIpn(vnpParams);
            if (!result.isSuccess) {
                return { rspCode: result.responseCode, message: result.message };
            }
            const bookingId = result.orderId;
            const vnpAmount = Number(vnpParams['vnp_Amount']) / 100;
            const transactionId = vnpParams['vnp_TransactionNo'];
            const processResult = await this.bookingService.handlePaymentCallback(bookingId, vnpAmount, transactionId);
            return { rspCode: processResult.rspCode, message: processResult.message };
        }
        catch (error) {
            logger.error("[PaymentCallbackService] VNPAY IPN ERROR:", error);
            return { rspCode: "99", message: "Unknown error" };
        }
    }
}
