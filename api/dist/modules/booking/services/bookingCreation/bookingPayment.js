import { PaymentMethod, BookingStatus, PaymentStatus } from "#generated/prisma";
export class BookingPayment {
    vnpayService;
    constructor(vnpayService) {
        this.vnpayService = vnpayService;
    }
    determineStatus(paymentMethod) {
        const method = paymentMethod ?? PaymentMethod.PAY_AT_HOTEL;
        const bookingStatus = method === PaymentMethod.PAY_AT_HOTEL ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
        const paymentStatus = PaymentStatus.UNPAID;
        return {
            paymentMethod: method,
            bookingStatus,
            paymentStatus,
        };
    }
    generatePaymentUrl(paymentMethod, totalAmount, bookingCode, bookingId, ipAddr) {
        if (paymentMethod === PaymentMethod.VNPAY) {
            const orderInfo = `Thanh toan dat phong ${bookingCode}`;
            return this.vnpayService.createPaymentUrl(ipAddr, totalAmount, orderInfo, bookingId);
        }
        return undefined;
    }
}
