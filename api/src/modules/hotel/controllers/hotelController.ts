import { Request, Response } from "express";
import { IHotelService } from "../interfaces/IHotelService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class HotelController {
  private readonly hotelService: IHotelService;

  constructor(hotelService: IHotelService) {
    this.hotelService = hotelService;
  }

  createHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Create hotel");

    const ownerId = req.user?.userId;

    const hotel = await this.hotelService.createHotel(
      ownerId as string,
      req.body,
    );

    successResponse(res, HttpStatus.OK, "Tạo khách sạn thành công", hotel);
  };

  getMyHotels = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Get my hotels");

    const ownerId = req.user?.userId as string;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.hotelService.getHotelsByAgent(
      ownerId,
      page,
      limit,
    );
    successResponse(
      res,
      HttpStatus.OK,
      "Lấy danh sách khách sạn thành công.",
      result,
    );
  };

  getHotelById = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Get hotel by id", {
      hotelId: req.params.id,
    });
    // Lấy ownerId từ user đang đăng nhập (Nếu là khách Public thì (req as any).user có thể undefined)
    const ownerId = req.user?.userId;
    const hotel = await this.hotelService.getHotelById(
      req.params.id as string,
      ownerId,
    );
    successResponse(
      res,
      HttpStatus.OK,
      "Lấy thông tin khách sạn thành công.",
      hotel,
    );
  };

  updateHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Update hotel", { hotelId: req.params.id });

    const ownerId = req.user?.userId as string;
    const hotel = await this.hotelService.updateHotel(
      req.params.id as string,
      ownerId,
      req.body,
    );

    successResponse(
      res,
      HttpStatus.OK,
      "Cập nhật khách sạn thành công.",
      hotel,
    );
  };

  softDeleteHotel = async (req: Request, res: Response): Promise<void> => {
    logger.warn("[HotelController] Soft delete hotel", {
      hotelId: req.params.id,
    });

    const ownerId = req.user?.userId as string;
    await this.hotelService.softDeleteHotel(req.params.id as string, ownerId);

    successResponse(res, HttpStatus.OK, "Xóa khách sạn thành công.");
  };

  restoreHotel = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Restore hotel", { hotelId: req.params.id });

    const ownerId = req.user?.userId as string;
    const hotel = await this.hotelService.restoreHotel(
      req.params.id as string,
      ownerId,
    );

    successResponse(
      res,
      HttpStatus.OK,
      "Khôi phục khách sạn thành công.",
      hotel,
    );
  };

  getAllHotels = async (req: Request, res: Response): Promise<void> => {
    logger.info("[HotelController] Get all hotels with queries", req.query);

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const { page: _p, limit: _l, ...filterQuery } = req.query;

    const result = await this.hotelService.getAllHotels(
      filterQuery,
      page,
      limit,
    );

    successResponse(
      res,
      HttpStatus.OK,
      "Lấy danh sách khách sạn thành công.",
      result,
    );
  };
}