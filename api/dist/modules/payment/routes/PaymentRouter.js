import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { PaymentController } from "../controllers/paymentController";
import { VnpayService } from "../services/vnpayService";
import { PaymentCallbackService } from "../services/paymentCallbackService";
import { BookingServiceFactory } from "../../booking/factory/bookingServiceFactory";
const router = Router();
const vnpayService = new VnpayService();
const bookingService = BookingServiceFactory.create();
const paymentCallbackService = new PaymentCallbackService(vnpayService, bookingService);
const paymentController = new PaymentController(paymentCallbackService);
router.get("/vnpay_ipn", 
/*
  #swagger.path = '/api/payments/vnpay_ipn'
  #swagger.tags = ['Payments']
  #swagger.summary = 'VNPay IPN Webhook'
*/
asyncHandler(paymentController.vnpayIpn));
export default router;
