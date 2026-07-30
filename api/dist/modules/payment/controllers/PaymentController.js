export class PaymentController {
    paymentCallbackService;
    constructor(paymentCallbackService) {
        this.paymentCallbackService = paymentCallbackService;
    }
    vnpayIpn = async (req, res) => {
        const result = await this.paymentCallbackService.processVnpayIpn(req.query);
        res.status(200).json({ RspCode: result.rspCode, Message: result.message });
    };
}
