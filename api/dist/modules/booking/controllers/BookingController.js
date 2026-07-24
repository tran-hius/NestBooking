import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";
export class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    createBooking = async (req, res) => {
        logger.info("[BookingController] Create booking");
        const userId = req.user?.userId;
        const data = req.body;
        const result = await this.bookingService.createBooking(userId, data);
        successResponse(res, HttpStatus.OK, "Yêu cầu đặt phòng đã được tiếp nhận và đang chờ xử lý.", result);
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
        const agentId = req.user?.userId;
        const { status } = req.body;
        const result = await this.bookingService.updateBookingStatus(id, agentId, status);
        successResponse(res, HttpStatus.OK, "Cập nhật trạng thái thành công.", result);
    };
    getHotelRevenue = async (req, res) => {
        const hotelId = req.params.hotelId;
        logger.info("[BookingController] Get hotel revenue", { hotelId });
        const agentId = req.user?.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const revenue = await this.bookingService.getHotelRevenue(hotelId, agentId, new Date(startDate), new Date(endDate));
        successResponse(res, HttpStatus.OK, "Thống kê doanh thu thành công.", { revenue });
    };
    getHotelOccupancy = async (req, res) => {
        const hotelId = req.params.hotelId;
        logger.info("[BookingController] Get hotel occupancy", { hotelId });
        const agentId = req.user?.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const occupancy = await this.bookingService.getHotelOccupancy(hotelId, agentId, new Date(startDate), new Date(endDate));
        successResponse(res, HttpStatus.OK, "Thống kê tỷ lệ lấp đầy thành công.", { occupancy });
    };
}
