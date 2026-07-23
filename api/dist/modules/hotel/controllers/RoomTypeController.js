import { successResponse } from "../../../utils/response.js";
import { HttpStatus } from "../../../constants/httpStatus.js";
import logger from "../../../config/logger.js";
export class RoomTypeController {
    roomTypeService;
    constructor(roomTypeService) {
        this.roomTypeService = roomTypeService;
    }
    createRoomType = async (req, res) => {
        logger.info("[RoomTypeController] Create room type");
        const ownerId = req.user?.userId;
        const hotelId = req.params.hotelId;
        const roomType = await this.roomTypeService.createRoomType(ownerId, hotelId, req.body);
        successResponse(res, HttpStatus.CREATED, "Tạo loại phòng thành công", roomType);
    };
    updateRoomType = async (req, res) => {
        logger.info("[RoomTypeController] Update room type", { id: req.params.id });
        const ownerId = req.user?.userId;
        const roomType = await this.roomTypeService.updateRoomType(ownerId, req.params.id, req.body);
        successResponse(res, HttpStatus.OK, "Cập nhật loại phòng thành công", roomType);
    };
    deleteRoomType = async (req, res) => {
        logger.warn("[RoomTypeController] Delete room type", { id: req.params.id });
        const ownerId = req.user?.userId;
        await this.roomTypeService.deleteRoomType(ownerId, req.params.id);
        successResponse(res, HttpStatus.OK, "Xóa loại phòng thành công.");
    };
    getRoomTypeById = async (req, res) => {
        logger.info("[RoomTypeController] Get room type by id", { id: req.params.id });
        const roomType = await this.roomTypeService.getRoomTypeById(req.params.id);
        successResponse(res, HttpStatus.OK, "Lấy loại phòng thành công.", roomType);
    };
    getRoomTypesByHotel = async (req, res) => {
        logger.info("[RoomTypeController] Get all room types for agent");
        const hotelId = req.params.hotelId;
        const roomTypes = await this.roomTypeService.getRoomTypesByHotel(hotelId);
        successResponse(res, HttpStatus.OK, "Lấy danh sách loại phòng thành công.", roomTypes);
    };
    getPublicRoomTypesByHotel = async (req, res) => {
        logger.info("[RoomTypeController] Get public room types");
        const hotelId = req.params.hotelId;
        const roomTypes = await this.roomTypeService.getPublicRoomTypesByHotel(hotelId);
        successResponse(res, HttpStatus.OK, "Lấy danh sách loại phòng thành công.", roomTypes);
    };
    addRoomTypeImages = async (req, res) => {
        logger.info("[RoomTypeController] Add room type images", { id: req.params.id });
        const ownerId = req.user?.userId;
        await this.roomTypeService.addRoomTypeImages(ownerId, req.params.id, req.body);
        successResponse(res, HttpStatus.CREATED, "Thêm ảnh loại phòng thành công.");
    };
    deleteRoomTypeImage = async (req, res) => {
        logger.warn("[RoomTypeController] Delete room type image", { imageId: req.params.imageId });
        const ownerId = req.user?.userId;
        await this.roomTypeService.deleteRoomTypeImage(ownerId, req.params.imageId);
        successResponse(res, HttpStatus.OK, "Xóa ảnh loại phòng thành công.");
    };
}
