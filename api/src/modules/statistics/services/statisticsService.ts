import { IStatisticsService } from "../interfaces/iStatisticsService";
import { IStatisticsRepository } from "../interfaces/iStatisticsRepository";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import logger from "@/config/logger";
import crypto from "crypto";

export class StatisticsService implements IStatisticsService {
  constructor(private readonly statsRepo: IStatisticsRepository) {}

  private generateHash(hotelId: string, startDate: Date, endDate: Date): string {
    return crypto
      .createHash("md5")
      .update(`${hotelId}_${startDate.toISOString()}_${endDate.toISOString()}`)
      .digest("hex");
  }

  async getHotelRevenue(hotelId: string, startDate: Date, endDate: Date): Promise<number> {
    const hash = this.generateHash(hotelId, startDate, endDate);
    const cacheKey = REDIS_KEYS.STATS_REVENUE(hash);
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      logger.debug(`[Cache Hit] Lấy doanh thu khách sạn ${hotelId} từ Redis`);
      return Number(cached);
    }

    logger.debug(`[Cache Miss] Tính toán doanh thu khách sạn ${hotelId} trong Database`);
    const revenue = await this.statsRepo.revenue(hotelId, startDate, endDate);

    await redisClient.setex(cacheKey, REDIS_TTL.STATS, revenue.toString());
    return revenue;
  }

  async getHotelOccupancy(hotelId: string, startDate: Date, endDate: Date): Promise<number> {
    const hash = this.generateHash(hotelId, startDate, endDate);
    const cacheKey = REDIS_KEYS.STATS_OCCUPANCY(hash);
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      logger.debug(`[Cache Hit] Lấy công suất phòng khách sạn ${hotelId} từ Redis`);
      return Number(cached);
    }

    logger.debug(`[Cache Miss] Tính toán công suất phòng khách sạn ${hotelId} trong Database`);
    const occupancy = await this.statsRepo.occupancy(hotelId, startDate, endDate);

    await redisClient.setex(cacheKey, REDIS_TTL.STATS, occupancy.toString());
    return occupancy;
  }
}
