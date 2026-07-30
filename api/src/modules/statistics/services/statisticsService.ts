import { IStatisticsService } from "../interfaces/iStatisticsService";
import { IStatisticsRepository } from "../interfaces/iStatisticsRepository";

export class StatisticsService implements IStatisticsService {
  constructor(private readonly statsRepo: IStatisticsRepository) {}

  async getHotelRevenue(hotelId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.statsRepo.revenue(hotelId, startDate, endDate);
  }

  async getHotelOccupancy(hotelId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.statsRepo.occupancy(hotelId, startDate, endDate);
  }
}
