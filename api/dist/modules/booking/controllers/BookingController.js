import { successResponse } from "../../../utils/response.js";
import { HttpStatus } from "../../../constants/httpStatus.js";
import logger from "../../../config/logger.js";
export class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    createBooking = async (req, res) => {
        logger.info("[BookingController] Create booking");
        const userId = req.user?.userId;
        const data = req.body;
        let ipAddr = req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "127.0.0.1";
        if (ipAddr.includes(",")) {
            ipAddr = ipAddr.split(",")[0];
        }
        const result = await this.bookingService.createBooking(userId, data, ipAddr);
        successResponse(res, HttpStatus.OK, "Yêu cầu đặt phòng đã được tiếp nhận.", result);
    };
    getBookingById = async (req, res) => {
        const id = req.params.id;
        logger.info("[BookingController] Get booking by id", { bookingId: id });
        const requesterId = req.user?.userId;
        const requesterRole = req.user?.role;
        const result = await this.bookingService.getBookingById(id, requesterId, requesterRole);
        successResponse(res, HttpStatus.OK, "Lấy chi tiết đơn đặt phòng thành công.", result);
    };
    getUserBookings = async (req, res) => {
        logger.info("[BookingController] Get user bookings");
        const userId = req.user?.userId;
        const result = await this.bookingService.getUserBookings(userId);
        successResponse(res, HttpStatus.OK, "Lấy danh sách đơn đặt phòng thành công.", result);
    };
    getAllBookings = async (_req, res) => {
        const result = await this.bookingService.getAllBookings();
        successResponse(res, HttpStatus.OK, "Lấy toàn bộ booking thành công.", result);
    };
    cancelBooking = async (req, res) => {
        const id = req.params.id;
        logger.info("[BookingController] Cancel booking", { bookingId: id });
        const userId = req.user?.userId;
        const result = await this.bookingService.cancelBooking(id, userId);
        successResponse(res, HttpStatus.OK, "Hủy đơn thành công.", result);
    };
    getHotelBookings = async (req, res) => {
        const hotelId = req.params.hotelId;
        logger.info("[BookingController] Get hotel bookings", { hotelId });
        const agentId = req.user?.userId;
        const result = await this.bookingService.getHotelBookings(hotelId, agentId);
        successResponse(res, HttpStatus.OK, "Lấy danh sách đơn đặt phòng thành công.", result);
    };
    updateBookingStatus = async (req, res) => {
        const id = req.params.id;
        logger.info("[BookingController] Update booking status", { bookingId: id });
        const requesterId = req.user?.userId;
        const requesterRole = req.user?.role;
        const { status } = req.body;
        const result = await this.bookingService.updateBookingStatus(id, requesterId, requesterRole, status);
        successResponse(res, HttpStatus.OK, "Cập nhật trạng thái thành công.", result);
    };
}
