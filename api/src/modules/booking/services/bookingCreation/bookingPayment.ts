import { VnpayService } from "@/modules/payment/services/vnpayService";
import { PaymentMethod, BookingStatus, PaymentStatus } from "#generated/prisma";

export class BookingPayment {
  constructor(private readonly vnpayService: VnpayService) {}

  determineStatus(paymentMethod: PaymentMethod | undefined) {
    const method = paymentMethod ?? PaymentMethod.PAY_AT_HOTEL;

    const bookingStatus = method === PaymentMethod.PAY_AT_HOTEL ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
    const paymentStatus = PaymentStatus.UNPAID;

    return {
        paymentMethod: method,
        bookingStatus,
        paymentStatus,
    }
  }

  generatePaymentUrl(paymentMethod: PaymentMethod, totalAmount: number, bookingCode: string, bookingId: string, ipAddr: string): string | undefined {
    if(paymentMethod === PaymentMethod.VNPAY){
        const orderInfo = `Thanh toan dat phong ${bookingCode}`;
        return this.vnpayService.createPaymentUrl(
            ipAddr,
            totalAmount,
            orderInfo,
            bookingId
        )
    }
    return undefined;
  }
}
