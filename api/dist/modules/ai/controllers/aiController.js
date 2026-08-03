import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";
export class AiController {
    aiAnalyticsService;
    constructor(aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }
    analyzeHotel = async (req, res) => {
        const hotelId = req.params.hotelId;
        const requesterId = req.user.userId;
        logger.info(`[AiController] Analyzing hotel ${hotelId} for agent ${requesterId}`);
        const analysisResult = await this.aiAnalyticsService.analyzeHotelBookings(hotelId, requesterId);
        successResponse(res, HttpStatus.OK, "Phân tích dữ liệu bằng AI thành công", { report: analysisResult });
    };
    analyzeAll = async (req, res) => {
        const requesterId = req.user.userId;
        logger.info(`[AiController] Analyzing ALL hotels for agent ${requesterId}`);
        const analysisResult = await this.aiAnalyticsService.analyzeAllHotels(requesterId);
        successResponse(res, HttpStatus.OK, "Phân tích dữ liệu toàn bộ khách sạn bằng AI thành công", { report: analysisResult });
    };
}
