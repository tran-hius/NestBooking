import { Request, Response } from "express";
import { IRoomService } from "../interfaces/IRoomService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class RoomController {
  private readonly roomService: IRoomService;

  constructor(roomService: IRoomService) {
    this.roomService = roomService;
  }

  createRoom = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomController] Create room");
    const ownerId = req.user?.userId as string;
    const { hotelId } = req.params;

    const room = await this.roomService.createRoom(ownerId, hotelId, req.body);
    successResponse(res, HttpStatus.CREATED, "Tạo phòng thành công", room);
  };

  updateRoom = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomController] Update room", { id: req.params.id });
    const ownerId = req.user?.userId as string;

    const room = await this.roomService.updateRoom(ownerId, req.params.id, req.body);
    successResponse(res, HttpStatus.OK, "Cập nhật phòng thành công", room);
  };

  deleteRoom = async (req: Request, res: Response): Promise<void> => {
    logger.warn("[RoomController] Delete room", { id: req.params.id });
    const ownerId = req.user?.userId as string;

    await this.roomService.deleteRoom(ownerId, req.params.id);
    successResponse(res, HttpStatus.OK, "Xóa phòng thành công.");
  };

  getRoomById = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomController] Get room by id", { id: req.params.id });
    const room = await this.roomService.getRoomById(req.params.id);
    successResponse(res, HttpStatus.OK, "Lấy thông tin phòng thành công.", room);
  };

  getRoomsByHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomController] Get rooms by hotel");
    const { hotelId } = req.params;
    const rooms = await this.roomService.getRoomsByHotel(hotelId);
    successResponse(res, HttpStatus.OK, "Lấy danh sách phòng thành công.", rooms);
  };

  getRoomsByRoomType = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomController] Get rooms by roomType");
    const { roomTypeId } = req.params;
    const rooms = await this.roomService.getRoomsByRoomType(roomTypeId);
    successResponse(res, HttpStatus.OK, "Lấy danh sách phòng thành công.", rooms);
  };
}
