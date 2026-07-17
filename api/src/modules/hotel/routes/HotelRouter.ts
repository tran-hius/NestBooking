import express from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate, authMiddleware, roleMiddleware } from "@/middlewares";
import { Role } from "../../../../generated/prisma";

import { HotelRepository } from "../repositories/HotelRepository";
import { HotelService } from "../services/HotelService";
import { HotelController } from "../controllers/HotelController";
import { CreateHotelSchema, UpdateHotelSchema } from "../dtos/HotelDTO";

const router = express.Router();

const hotelRepository = new HotelRepository(prisma);
const hotelService = new HotelService(hotelRepository);
const hotelController = new HotelController(hotelService);

// =====================================================
// GET ALL HOTELS (Public API)
// =====================================================
router.get(
  "/",
  /*
    #swagger.path = '/api/hotels'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Lấy danh sách tất cả khách sạn (Public)'
    #swagger.parameters['page'] = { in: 'query', description: 'Trang hiện tại', type: 'integer' }
    #swagger.parameters['limit'] = { in: 'query', description: 'Số lượng trên 1 trang', type: 'integer' }
  */
  asyncHandler(hotelController.getAllHotels),
);

// =====================================================
// GET MY HOTELS (Agent Only)
// =====================================================
router.get(
  "/my-hotels",
  /*
    #swagger.path = '/api/hotels/my-hotels'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Lấy danh sách khách sạn của Agent đang đăng nhập'
    #swagger.parameters['page'] = { in: 'query', type: 'integer' }
    #swagger.parameters['limit'] = { in: 'query', type: 'integer' }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT]),
  asyncHandler(hotelController.getMyHotels),
);

// =====================================================
// GET HOTEL BY ID (Public / Agent)
// =====================================================
router.get(
  "/:id",
  /*
    #swagger.path = '/api/hotels/{id}'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Lấy chi tiết một khách sạn theo ID'
  */
  // Nếu muốn khách vãng lai cũng xem được chi tiết, em có thể dùng middleware optionalAuth (nếu có)
  // Tạm thời ở đây giả định là ai có ID cũng xem được.
  asyncHandler(hotelController.getHotelById),
);

// =====================================================
// CREATE HOTEL
// =====================================================
router.post(
  "/",
  /*
    #swagger.path = '/api/hotels'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Tạo khách sạn mới (Dành cho Agent và Admin)'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/CreateHotelDto"
          }
        }
      }
    }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(CreateHotelSchema),
  asyncHandler(hotelController.createHotel),
);

// =====================================================
// UPDATE HOTEL
// =====================================================
router.put(
  "/:id",
  /*
    #swagger.path = '/api/hotels/{id}'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Cập nhật thông tin khách sạn'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UpdateHotelDto"
          }
        }
      }
    }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(UpdateHotelSchema),
  asyncHandler(hotelController.updateHotel),
);

// =====================================================
// SOFT DELETE
// =====================================================
router.delete(
  "/:id",
  /*
    #swagger.path = '/api/hotels/{id}'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Xóa mềm khách sạn'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(hotelController.softDeleteHotel),
);

// =====================================================
// RESTORE HOTEL
// =====================================================
router.post(
  "/:id/restore",
  /*
    #swagger.path = '/api/hotels/{id}/restore'
    #swagger.tags = ['Hotels']
    #swagger.summary = 'Khôi phục khách sạn đã bị xóa mềm'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(hotelController.restoreHotel),
);

export default router;
