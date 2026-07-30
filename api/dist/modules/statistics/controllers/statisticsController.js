import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";
export class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    getHotelRevenue = async (req, res) => {
        const hotelId = req.params.hotelId;
        logger.info("[StatisticsController] Get hotel revenue", { hotelId });
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const revenue = await this.statisticsService.getHotelRevenue(hotelId, new Date(startDate), new Date(endDate));
        successResponse(res, HttpStatus.OK, "Thống kê doanh thu thành công.", { revenue });
    };
    getHotelOccupancy = async (req, res) => {
        const hotelId = req.params.hotelId;
        logger.info("[StatisticsController] Get hotel occupancy", { hotelId });
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const occupancy = await this.statisticsService.getHotelOccupancy(hotelId, new Date(startDate), new Date(endDate));
        successResponse(res, HttpStatus.OK, "Thống kê tỷ lệ lấp đầy thành công.", { occupancy });
    };
}
