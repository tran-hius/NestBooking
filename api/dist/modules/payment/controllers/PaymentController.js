import { env } from "@/config/env";
export class PaymentController {
    paymentCallbackService;
    constructor(paymentCallbackService) {
        this.paymentCallbackService = paymentCallbackService;
    }
    vnpayIpn = async (req, res) => {
        const result = await this.paymentCallbackService.processVnpayIpn(req.query);
        res.status(200).json({ RspCode: result.rspCode, Message: result.message });
    };
    vnpayReturn = async (req, res) => {
        const result = await this.paymentCallbackService.processVnpayReturn(req.query);
        const params = new URLSearchParams({
            status: result.status,
            code: result.responseCode,
            message: result.message,
        });
        if (result.bookingId)
            params.set("bookingId", result.bookingId);
        res.redirect(`${env.CLIENT_URL}/payment/result?${params.toString()}`);
    };
}
