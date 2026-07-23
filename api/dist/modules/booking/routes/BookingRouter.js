import { Router } from "express";
import { prisma } from "../../../config/prisma.js";
import { authMiddleware, roleMiddleware } from "../../../middlewares/index.js";
import { validate } from "../../../middlewares/validationMiddleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Role } from "../../../../generated/prisma/index.js";
import { CreateBookingSchema, UpdateBookingStatusSchema } from "../dtos/BookingDTO.js";
import { BookingReadRepository } from "../repositories/BookingReadRepository.js";
import { BookingWriteRepository } from "../repositories/BookingWriteRepository.js";
import { BookingStatisticsRepository } from "../repositories/BookingStatisticsRepository.js";
import { HotelService } from "../../hotel/services/HotelService.js";
import { RoomTypeService } from "../../hotel/services/RoomTypeService.js";
import { RoomService } from "../../hotel/services/RoomService.js";
import { RoomTypeRepository } from "../../hotel/repositories/RoomTypeRepository.js";
import { RoomRepository } from "../../hotel/repositories/RoomRepository.js";
import { HotelRepository } from "../../hotel/repositories/HotelRepository.js";
import { BookingService } from "../services/BookingService.js";
import { BookingController } from "../controllers/BookingController.js";
const router = Router();
const readRepo = new BookingReadRepository(prisma);
const writeRepo = new BookingWriteRepository(prisma);
const statsRepo = new BookingStatisticsRepository(prisma);
const hotelRepo = new HotelRepository(prisma);
const roomTypeRepo = new RoomTypeRepository(prisma);
const roomRepo = new RoomRepository(prisma);
const hotelService = new HotelService(hotelRepo);
const roomTypeService = new RoomTypeService(roomTypeRepo, hotelRepo);
const roomService = new RoomService(roomRepo, roomTypeRepo, hotelRepo);
const bookingService = new BookingService(readRepo, writeRepo, statsRepo, hotelService, roomTypeService, roomService);
const bookingController = new BookingController(bookingService);
router.get("/my-bookings", 
/*
  #swagger.path = '/api/bookings/my-bookings'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Lấy danh sách đơn đặt phòng của User hiện tại'
  #swagger.security = [{
    "bearerAuth": []
  }]
*/
authMiddleware, asyncHandler(bookingController.getUserBookings));
router.post("/", 
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
authMiddleware, validate(CreateBookingSchema), asyncHandler(bookingController.createBooking));
router.post("/:id/cancel", 
/*
  #swagger.path = '/api/bookings/{id}/cancel'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Hủy đơn đặt phòng (Chỉ dành cho đơn PENDING)'
  #swagger.security = [{
    "bearerAuth": []
  }]
*/
authMiddleware, asyncHandler(bookingController.cancelBooking));
router.get("/hotel/:hotelId", 
/*
  #swagger.path = '/api/bookings/hotel/{hotelId}'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Lấy danh sách đơn đặt phòng của 1 Khách sạn (Dành cho Agent/Admin)'
  #swagger.security = [{
    "bearerAuth": []
  }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(bookingController.getHotelBookings));
router.get("/hotel/:hotelId/revenue", 
/*
  #swagger.path = '/api/bookings/hotel/{hotelId}/revenue'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Thống kê doanh thu khách sạn theo thời gian'
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['startDate'] = {
      in: 'query',
      description: 'Ngày bắt đầu (YYYY-MM-DD)',
      type: 'string'
  }
  #swagger.parameters['endDate'] = {
      in: 'query',
      description: 'Ngày kết thúc (YYYY-MM-DD)',
      type: 'string'
  }
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(bookingController.getHotelRevenue));
router.get("/hotel/:hotelId/occupancy", 
/*
  #swagger.path = '/api/bookings/hotel/{hotelId}/occupancy'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Thống kê tỷ lệ lấp đầy khách sạn theo thời gian'
  #swagger.security = [{
    "bearerAuth": []
  }]
  #swagger.parameters['startDate'] = {
      in: 'query',
      description: 'Ngày bắt đầu (YYYY-MM-DD)',
      type: 'string'
  }
  #swagger.parameters['endDate'] = {
      in: 'query',
      description: 'Ngày kết thúc (YYYY-MM-DD)',
      type: 'string'
  }
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(bookingController.getHotelOccupancy));
router.patch("/:id/status", 
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
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), validate(UpdateBookingStatusSchema), asyncHandler(bookingController.updateBookingStatus));
router.get("/:id", 
/*
  #swagger.path = '/api/bookings/{id}'
  #swagger.tags = ['Bookings']
  #swagger.summary = 'Lấy chi tiết đơn đặt phòng'
  #swagger.security = [{
    "bearerAuth": []
  }]
*/
authMiddleware, asyncHandler(bookingController.getBookingById));
export default router;
