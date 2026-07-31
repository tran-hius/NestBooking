import { Router } from "express";
import { authMiddleware, roleMiddleware} from "@/middlewares";
import { validate } from "@/middlewares/validationMiddleware";
import { asyncHandler } from "@/utils/asyncHandler";
import { Role } from "../../../../generated/prisma";

import { CreateBookingSchema, UpdateBookingStatusSchema } from "../dtos/bookingDTO";
import { BookingController } from "../controllers/bookingController";
import { BookingServiceFactory } from "../factory/bookingServiceFactory";

const router = Router();

const bookingService = BookingServiceFactory.create();
const bookingController = new BookingController(bookingService);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  asyncHandler(bookingController.getAllBookings),
);

router.get(
  "/my-bookings",
  /*
    #swagger.path = '/api/bookings/my-bookings'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Lấy danh sách đơn đặt phòng của User hiện tại'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  authMiddleware,
  asyncHandler(bookingController.getUserBookings)
);

router.post(
  "/",
  /*
    #swagger.path = '/api/bookings'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Tạo đơn đặt phòng mới'
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/CreateBookingDto"
          }
        }
      }
    }
  */
  authMiddleware,
  validate(CreateBookingSchema),
  asyncHandler(bookingController.createBooking)
);

router.post(
  "/:id/cancel",
  /*
    #swagger.path = '/api/bookings/{id}/cancel'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Hủy đơn đặt phòng (Chỉ dành cho đơn PENDING)'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  authMiddleware,
  asyncHandler(bookingController.cancelBooking)
);

router.get(
  "/hotel/:hotelId",
  /*
    #swagger.path = '/api/bookings/hotel/{hotelId}'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Lấy danh sách đơn đặt phòng của 1 Khách sạn (Dành cho Agent/Admin)'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(bookingController.getHotelBookings)
);

router.patch(
  "/:id/status",
  /*
    #swagger.path = '/api/bookings/{id}/status'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Cập nhật trạng thái đơn đặt phòng (Dành cho Agent/Admin)'
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UpdateBookingStatusDto"
          }
        }
      }
    }
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(UpdateBookingStatusSchema),
  asyncHandler(bookingController.updateBookingStatus)
);



router.get(
  "/:id",
  /*
    #swagger.path = '/api/bookings/{id}'
    #swagger.tags = ['Bookings']
    #swagger.summary = 'Lấy chi tiết đơn đặt phòng'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  authMiddleware,
  asyncHandler(bookingController.getBookingById)
);

export default router;
