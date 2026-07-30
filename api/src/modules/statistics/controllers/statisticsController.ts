import { Request, Response } from "express";
import { IStatisticsService } from "../interfaces/iStatisticsService";
import { successResponse } from "@/utils/response";
import { HttpStatus } from "@/constants/httpStatus";
import logger from "@/config/logger";

export class StatisticsController {
  constructor(private readonly statisticsService: IStatisticsService) {}

  public getHotelRevenue = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    logger.info("[StatisticsController] Get hotel revenue", { hotelId });
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const revenue = await this.statisticsService.getHotelRevenue(
      hotelId, new Date(startDate), new Date(endDate)
    );
    
    successResponse(res, HttpStatus.OK, "Thống kê doanh thu thành công.", { revenue });
  };

  public getHotelOccupancy = async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId as string;
    logger.info("[StatisticsController] Get hotel occupancy", { hotelId });
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const occupancy = await this.statisticsService.getHotelOccupancy(
      hotelId, new Date(startDate), new Date(endDate)
    );
    
    successResponse(res, HttpStatus.OK, "Thống kê tỷ lệ lấp đầy thành công.", { occupancy });
  };
}
