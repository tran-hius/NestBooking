import { Request, Response } from "express";
import { BookingService } from "../services/BookingService";
import { CreateBookingDto, UpdateBookingStatusDto } from "../dtos/BookingDTO";
import { BookingStatus } from "../../../../generated/prisma";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  public createBooking = async (req: Request, res: Response): Promise<void> => {
    logger.info("[BookingController] Create booking");
    
    const userId = req.user?.userId as string;
    const data = req.body as CreateBookingDto;
    const result = await this.bookingService.createBooking(userId, data);
    
    successResponse(
      res, 
      HttpStatus.OK, 
      "Yêu cầu đặt phòng đã được tiếp nhận và đang chờ xử lý.", 
      result
    );
  };

  public getBookingById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    logger.info("[BookingController] Get booking by id", { bookingId: id });

    const requesterId = req.user?.userId as string;
    const requesterRole = req.user?.role as string;
    
    const result = await this.bookingService.getBookingById(id, requesterId, requesterRole);
    
    successResponse(res, HttpStatus.OK, "Lấy chi tiết đơn đặt phòng thành công.", result);
  };

  public getUserBookings = async (req: Request, res: Response): Promise<void> => {
    logger.info("[BookingController] Get user bookings");
    
    const userId = req.user?.userId as string;
    const result = await this.bookingService.getUserBookings(userId);
    
    successResponse(res, HttpStatus.OK, "Lấy danh sách đơn đặt phòng thành công.", result);
  };

  public cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    logger.info("[BookingController] Cancel booking", { bookingId: id });
    
    const userId = req.user?.userId as string;
    const result = await this.bookingService.cancelBooking(id, userId);
    
    successResponse(res, HttpStatus.OK, "Hủy đơn thành công.", result);
  };

  public getHotelBookings = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    logger.info("[BookingController] Get hotel bookings", { hotelId });
    
    const agentId = req.user?.userId as string;
    const result = await this.bookingService.getHotelBookings(hotelId, agentId);
    
    successResponse(res, HttpStatus.OK, "Lấy danh sách đơn đặt phòng thành công.", result);
  };

  public updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    logger.info("[BookingController] Update booking status", { bookingId: id });
    
    const agentId = req.user?.userId as string;
    const { status } = req.body as { status: BookingStatus };
    const result = await this.bookingService.updateBookingStatus(id, agentId, status);
    
    successResponse(res, HttpStatus.OK, "Cập nhật trạng thái thành công.", result);
  };

  public getHotelRevenue = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    logger.info("[BookingController] Get hotel revenue", { hotelId });
    
    const agentId = req.user?.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const revenue = await this.bookingService.getHotelRevenue(
      hotelId, agentId, new Date(startDate), new Date(endDate)
    );
    
    successResponse(res, HttpStatus.OK, "Thống kê doanh thu thành công.", { revenue });
  };

  public getHotelOccupancy = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    logger.info("[BookingController] Get hotel occupancy", { hotelId });
    
    const agentId = req.user?.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const occupancy = await this.bookingService.getHotelOccupancy(
      hotelId, agentId, new Date(startDate), new Date(endDate)
    );
    
    successResponse(res, HttpStatus.OK, "Thống kê tỷ lệ lấp đầy thành công.", { occupancy });
  };
}
