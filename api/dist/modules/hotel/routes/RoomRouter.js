import express from "express";
import { prisma } from "../../../config/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validate, authMiddleware, roleMiddleware } from "../../../middlewares/index.js";
import { Role } from "../../../../generated/prisma/index.js";
import { RoomRepository } from "../repositories/RoomRepository.js";
import { RoomTypeRepository } from "../repositories/RoomTypeRepository.js";
import { HotelRepository } from "../repositories/HotelRepository.js";
import { RoomService } from "../services/RoomService.js";
import { RoomController } from "../controllers/RoomController.js";
import { CreateRoomSchema, UpdateRoomSchema } from "../dtos/RoomDTO.js";
const router = express.Router({ mergeParams: true });
const roomRepository = new RoomRepository(prisma);
const roomTypeRepository = new RoomTypeRepository(prisma);
const hotelRepository = new HotelRepository(prisma);
const roomService = new RoomService(roomRepository, roomTypeRepository, hotelRepository);
const roomController = new RoomController(roomService);
// =====================================================
// AGENT/ADMIN APIs (Tất cả liên quan đến phòng vật lý đều cần auth)
// =====================================================
router.get("/hotel/:hotelId", 
/*
  #swagger.path = '/api/rooms/hotel/{hotelId}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Lấy danh sách tất cả phòng vật lý của khách sạn (Dành cho Lễ tân/Agent)'
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(roomController.getRoomsByHotel));
router.get("/room-type/:roomTypeId", 
/*
  #swagger.path = '/api/rooms/room-type/{roomTypeId}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Lấy danh sách phòng vật lý thuộc một loại phòng cụ thể'
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(roomController.getRoomsByRoomType));
router.get("/:id", 
/*
  #swagger.path = '/api/rooms/{id}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Lấy chi tiết một phòng'
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(roomController.getRoomById));
router.post("/:hotelId", 
/*
  #swagger.path = '/api/rooms/{hotelId}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Tạo phòng vật lý mới'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/CreateRoomDto"
        }
      }
    }
  }
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), validate(CreateRoomSchema), asyncHandler(roomController.createRoom));
router.put("/:id", 
/*
  #swagger.path = '/api/rooms/{id}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Cập nhật phòng vật lý (Đổi số phòng, status...)'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/UpdateRoomDto"
        }
      }
    }
  }
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), validate(UpdateRoomSchema), asyncHandler(roomController.updateRoom));
router.delete("/:id", 
/*
  #swagger.path = '/api/rooms/{id}'
  #swagger.tags = ['Rooms']
  #swagger.summary = 'Xóa phòng'
  #swagger.security = [{ "bearerAuth": [] }]
*/
authMiddleware, roleMiddleware([Role.AGENT, Role.ADMIN]), asyncHandler(roomController.deleteRoom));
export default router;
