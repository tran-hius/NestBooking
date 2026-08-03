import { Request, Response } from "express";
import { IBookingService } from "../interfaces/iBookingService";
import { CreateBookingDto, UpdateBookingStatusDto } from "../dtos/bookingDTO";
import { BookingStatus } from "../../../../generated/prisma";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class BookingController {
  constructor(private readonly bookingService: IBookingService) {}

  public createBooking = async (req: Request, res: Response): Promise<void> => {
    logger.info("[BookingController] Create booking");
    
    const userId = req.user?.userId as string;
    const data = req.body as CreateBookingDto;

    let ipAddr = req.headers["x-forwarded-for"] as string || 
                 req.socket.remoteAddress || 
                 "127.0.0.1";
                 
    if (ipAddr.includes(",")) {
        ipAddr = ipAddr.split(",")[0];
    }
    
    const result = await this.bookingService.createBooking(userId, data, ipAddr);
    
    successResponse(
      res, 
      HttpStatus.OK, 
      "Yêu cầu đặt phòng đã được tiếp nhận.", 
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

  public getAllBookings = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.bookingService.getAllBookings();
    successResponse(res, HttpStatus.OK, "Lấy toàn bộ booking thành công.", result);
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
    
    const requesterId = req.user?.userId as string;
    const requesterRole = req.user?.role as string;
    const { status, roomIds } = req.body as { status: BookingStatus, roomIds?: string[] };
    const result = await this.bookingService.updateBookingStatus(id, requesterId, requesterRole, status, roomIds);
    
    successResponse(res, HttpStatus.OK, "Cập nhật trạng thái thành công.", result);
  };

  public updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    logger.info("[BookingController] Update payment status", { bookingId: id });
    
    const requesterId = req.user?.userId as string;
    const requesterRole = req.user?.role as string;
    const { paymentStatus } = req.body as { paymentStatus: any };
    const result = await this.bookingService.updatePaymentStatus(id, requesterId, requesterRole, paymentStatus);
    
    successResponse(res, HttpStatus.OK, "Cập nhật trạng thái thanh toán thành công.", result);
  };


  public getHotelAvailability = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      successResponse(res, HttpStatus.BAD_REQUEST, "Thiếu checkIn hoặc checkOut.", null);
      return;
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      successResponse(res, HttpStatus.BAD_REQUEST, "Định dạng ngày không hợp lệ.", null);
      return;
    }

    const result = await this.bookingService.getHotelAvailability(hotelId, checkInDate, checkOutDate);
    
    successResponse(res, HttpStatus.OK, "Lấy thông tin phòng trống thành công.", result);
  };
}
