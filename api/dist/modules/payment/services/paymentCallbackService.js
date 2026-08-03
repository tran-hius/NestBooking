import logger from "@/config/logger";
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
            const vnpAmount = result.amount;
            const transactionId = result.transactionId;
            if (!transactionId) {
                return { rspCode: "99", message: "Missing transaction number" };
            }
            const processResult = await this.bookingService.handlePaymentCallback(bookingId, vnpAmount, transactionId);
            return { rspCode: processResult.rspCode, message: processResult.message };
        }
        catch (error) {
            logger.error("[PaymentCallbackService] VNPAY IPN ERROR:", error);
            return { rspCode: "99", message: "Unknown error" };
        }
    }
    async processVnpayReturn(vnpParams) {
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
        const processed = await this.bookingService.handlePaymentCallback(result.orderId, result.amount, result.transactionId);
        const success = processed.rspCode === "00" || processed.rspCode === "02";
        return {
            status: success ? "success" : "failed",
            bookingId: result.orderId,
            responseCode: processed.rspCode,
            message: processed.message,
        };
    }
}
