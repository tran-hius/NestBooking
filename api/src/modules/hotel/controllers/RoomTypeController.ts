import { Request, Response } from "express";
import { IRoomTypeService } from "../interfaces/IRoomTypeService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class RoomTypeController {
  private readonly roomTypeService: IRoomTypeService;

  constructor(roomTypeService: IRoomTypeService) {
    this.roomTypeService = roomTypeService;
  }

  createRoomType = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Create room type");
    const ownerId = req.user?.userId as string;
    const hotelId = req.params.hotelId as string;

    const roomType = await this.roomTypeService.createRoomType(
      ownerId,
      hotelId,
      req.body
    );
    successResponse(res, HttpStatus.CREATED, "Tạo loại phòng thành công", roomType);
  };

  updateRoomType = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Update room type", { id: (req.params.id as string) });
    const ownerId = req.user?.userId as string;

    const roomType = await this.roomTypeService.updateRoomType(
      ownerId,
      (req.params.id as string),
      req.body
    );
    successResponse(res, HttpStatus.OK, "Cập nhật loại phòng thành công", roomType);
  };

  deleteRoomType = async (req: Request, res: Response): Promise<void> => {
    logger.warn("[RoomTypeController] Delete room type", { id: (req.params.id as string) });
    const ownerId = req.user?.userId as string;

    await this.roomTypeService.deleteRoomType(ownerId, (req.params.id as string));
    successResponse(res, HttpStatus.OK, "Xóa loại phòng thành công.");
  };

  getRoomTypeById = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Get room type by id", { id: (req.params.id as string) });
    const roomType = await this.roomTypeService.getRoomTypeById((req.params.id as string));
    successResponse(res, HttpStatus.OK, "Lấy loại phòng thành công.", roomType);
  };

  getRoomTypesByHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Get all room types for agent");
    const hotelId = req.params.hotelId as string;
    const roomTypes = await this.roomTypeService.getRoomTypesByHotel(hotelId);
    successResponse(res, HttpStatus.OK, "Lấy danh sách loại phòng thành công.", roomTypes);
  };

  getPublicRoomTypesByHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Get public room types");
    const hotelId = req.params.hotelId as string;
    const roomTypes = await this.roomTypeService.getPublicRoomTypesByHotel(hotelId);
    successResponse(res, HttpStatus.OK, "Lấy danh sách loại phòng thành công.", roomTypes);
  };

  addRoomTypeImages = async (req: Request, res: Response): Promise<void> => {
    logger.info("[RoomTypeController] Add room type images", { id: (req.params.id as string) });
    const ownerId = req.user?.userId as string;

    await this.roomTypeService.addRoomTypeImages(ownerId, (req.params.id as string), req.body);
    successResponse(res, HttpStatus.CREATED, "Thêm ảnh loại phòng thành công.");
  };

  deleteRoomTypeImage = async (req: Request, res: Response): Promise<void> => {
    logger.warn("[RoomTypeController] Delete room type image", { imageId: (req.params.imageId as string) });
    const ownerId = req.user?.userId as string;

    await this.roomTypeService.deleteRoomTypeImage(ownerId, (req.params.imageId as string));
    successResponse(res, HttpStatus.OK, "Xóa ảnh loại phòng thành công.");
  };
}
