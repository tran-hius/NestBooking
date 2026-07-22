import express from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate, authMiddleware, roleMiddleware } from "@/middlewares";
import { Role } from "../../../../generated/prisma";

import { RoomTypeRepository } from "../repositories/RoomTypeRepository";
import { HotelRepository } from "../repositories/HotelRepository";
import { RoomTypeService } from "../services/RoomTypeService";
import { RoomTypeController } from "../controllers/RoomTypeController";
import { 
  CreateRoomTypeSchema, 
  UpdateRoomTypeSchema,
  AddRoomTypeImagesSchema
} from "../dtos/RoomTypeDTO";

const router = express.Router({ mergeParams: true }); // cho phép nhận hotelId từ parent route

const roomTypeRepository = new RoomTypeRepository(prisma);
const hotelRepository = new HotelRepository(prisma);
const roomTypeService = new RoomTypeService(roomTypeRepository, hotelRepository);
const roomTypeController = new RoomTypeController(roomTypeService);

// =====================================================
// PUBLIC APIs
// =====================================================

router.get(
  "/:hotelId/public",
  /*
    #swagger.path = '/api/room-types/{hotelId}/public'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Lấy danh sách loại phòng công khai của 1 khách sạn (Dành cho Khách)'
  */
  asyncHandler(roomTypeController.getPublicRoomTypesByHotel),
);

router.get(
  "/:id",
  /*
    #swagger.path = '/api/room-types/{id}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Lấy chi tiết loại phòng theo ID'
  */
  asyncHandler(roomTypeController.getRoomTypeById),
);

// =====================================================
// AGENT/ADMIN APIs
// =====================================================

router.get(
  "/hotel/:hotelId",
  /*
    #swagger.path = '/api/room-types/hotel/{hotelId}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Lấy tất cả loại phòng của khách sạn (Bao gồm cả ngưng bán - Dành cho Agent)'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(roomTypeController.getRoomTypesByHotel),
);

router.post(
  "/:hotelId",
  /*
    #swagger.path = '/api/room-types/{hotelId}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Tạo loại phòng mới'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/CreateRoomTypeDto"
          }
        }
      }
    }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(CreateRoomTypeSchema),
  asyncHandler(roomTypeController.createRoomType),
);

router.put(
  "/:id",
  /*
    #swagger.path = '/api/room-types/{id}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Cập nhật loại phòng'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UpdateRoomTypeDto"
          }
        }
      }
    }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(UpdateRoomTypeSchema),
  asyncHandler(roomTypeController.updateRoomType),
);

router.delete(
  "/:id",
  /*
    #swagger.path = '/api/room-types/{id}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Xóa loại phòng'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(roomTypeController.deleteRoomType),
);

router.post(
  "/:id/images",
  /*
    #swagger.path = '/api/room-types/{id}/images'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Thêm ảnh cho loại phòng'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/AddRoomTypeImagesDto"
          }
        }
      }
    }
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  validate(AddRoomTypeImagesSchema),
  asyncHandler(roomTypeController.addRoomTypeImages),
);

router.delete(
  "/images/:imageId",
  /*
    #swagger.path = '/api/room-types/images/{imageId}'
    #swagger.tags = ['RoomTypes']
    #swagger.summary = 'Xóa 1 ảnh của loại phòng'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  authMiddleware,
  roleMiddleware([Role.AGENT, Role.ADMIN]),
  asyncHandler(roomTypeController.deleteRoomTypeImage),
);

export default router;
