import { Router } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";

import { PaymentController } from "../controllers/PaymentController";
import { VnpayService } from "../services/VnpayService";
import { BookingReadRepository } from "../../booking/repositories/BookingReadRepository";
import { BookingWriteRepository } from "../../booking/repositories/BookingWriteRepository";

const router = Router();

const vnpayService = new VnpayService();
const bookingReadRepo = new BookingReadRepository(prisma);
const bookingWriteRepo = new BookingWriteRepository(prisma);

const paymentController = new PaymentController(
  vnpayService,
  bookingReadRepo,
  bookingWriteRepo
);

router.get(
  "/vnpay_ipn",
  /*
    #swagger.path = '/api/payments/vnpay_ipn'
    #swagger.tags = ['Payments']
    #swagger.summary = 'VNPay IPN Webhook'
  */
  asyncHandler(paymentController.vnpayIpn)
);

export default router;
