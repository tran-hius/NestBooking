import { Router } from "express";
import { prisma } from "../../../config/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { PaymentController } from "../controllers/PaymentController.js";
import { VnpayService } from "../services/VnpayService.js";
import { BookingReadRepository } from "../../booking/repositories/BookingReadRepository.js";
import { BookingWriteRepository } from "../../booking/repositories/BookingWriteRepository.js";
const router = Router();
const vnpayService = new VnpayService();
const bookingReadRepo = new BookingReadRepository(prisma);
const bookingWriteRepo = new BookingWriteRepository(prisma);
const paymentController = new PaymentController(vnpayService, bookingReadRepo, bookingWriteRepo);
router.get("/vnpay_ipn", 
/*
  #swagger.path = '/api/payments/vnpay_ipn'
  #swagger.tags = ['Payments']
  #swagger.summary = 'VNPay IPN Webhook'
*/
asyncHandler(paymentController.vnpayIpn));
export default router;
