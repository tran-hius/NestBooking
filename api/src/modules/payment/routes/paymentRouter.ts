import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";

import { PaymentController } from "../controllers/paymentController";
import { VnpayService } from "../services/vnpayService";
import { PaymentCallbackService } from "../services/paymentCallbackService";
import { BookingServiceFactory } from "../../booking/factory/bookingServiceFactory";

import { authMiddleware } from "@/middlewares/authMiddleware";

const router = Router();

const vnpayService = new VnpayService();
const bookingService = BookingServiceFactory.create();
const paymentCallbackService = new PaymentCallbackService(vnpayService, bookingService);

const paymentController = new PaymentController(paymentCallbackService, vnpayService, bookingService);

router.get("/generate_url/:bookingId", authMiddleware, asyncHandler(paymentController.generatePaymentUrl));

router.get(
  "/vnpay_ipn",
  /*
    #swagger.path = '/api/payments/vnpay_ipn'
    #swagger.tags = ['Payments']
    #swagger.summary = 'VNPay IPN Webhook'
  */
  asyncHandler(paymentController.vnpayIpn)
);

router.get(
  "/vnpay_return",
  asyncHandler(paymentController.vnpayReturn),
);

export default router;
