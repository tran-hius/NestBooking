import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { PaymentController } from "../controllers/paymentController.js";
import { VnpayService } from "../services/vnpayService.js";
import { PaymentCallbackService } from "../services/paymentCallbackService.js";
import { BookingServiceFactory } from "../../booking/factory/bookingServiceFactory.js";
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
