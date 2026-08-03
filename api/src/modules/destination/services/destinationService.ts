import { IDestinationService } from "../interfaces/iDestinationService";
import { IDestinationRepository } from "../interfaces/iDestinationRepository";
import {
  CreateDestinationDto,
  DestinationResponseDto,
  UpdateDestinationDto,
} from "../dtos/destinationDto";
import { DestinationMapper } from "../mapper/destinationMapper";
import { redisClient, REDIS_KEYS, REDIS_TTL } from "@/infrastructure/redis";
import logger from "@/config/logger";

export class DestinationService implements IDestinationService {
  constructor(private readonly destinationRepository: IDestinationRepository) {}

  private async invalidateCache() {
    await redisClient.del(REDIS_KEYS.DESTINATIONS_ACTIVE, REDIS_KEYS.DESTINATIONS_ALL);
  }

  async getActiveDestinations(): Promise<DestinationResponseDto[]> {
    const cacheKey = REDIS_KEYS.DESTINATIONS_ACTIVE;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      logger.debug(`[Cache Hit] Lấy danh sách điểm đến hoạt động từ Redis`);
      return JSON.parse(cached);
    }

    logger.debug(`[Cache Miss] Tìm danh sách điểm đến hoạt động trong Database`);
    const destinations = await this.destinationRepository.getActiveDestinations();
    const result = DestinationMapper.toResponseDtoList(destinations);
    
    await redisClient.setex(cacheKey, REDIS_TTL.DESTINATION, JSON.stringify(result));
    return result;
  }

  async getAllDestinations(): Promise<DestinationResponseDto[]> {
    const cacheKey = REDIS_KEYS.DESTINATIONS_ALL;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      logger.debug(`[Cache Hit] Lấy toàn bộ điểm đến từ Redis`);
      return JSON.parse(cached);
    }

    logger.debug(`[Cache Miss] Tìm toàn bộ điểm đến trong Database`);
    const destinations = await this.destinationRepository.getAllDestinations();
    const result = DestinationMapper.toResponseDtoList(destinations);
    
    await redisClient.setex(cacheKey, REDIS_TTL.DESTINATION, JSON.stringify(result));
    return result;
  }

  async createDestination(
    data: CreateDestinationDto,
  ): Promise<DestinationResponseDto> {
    if (!data.name || !data.slug || !data.imageUrl) {
      throw new Error("Missing required fields");
    }

    const destination = await this.destinationRepository.createDestination(data);
    await this.invalidateCache();
    return DestinationMapper.toResponseDto(destination);
  }

  async updateDestination(
    id: string,
    data: UpdateDestinationDto,
  ): Promise<DestinationResponseDto> {
    const destination = await this.destinationRepository.updateDestination(id, data);
    await this.invalidateCache();
    return DestinationMapper.toResponseDto(destination);
  }

  async deleteDestination(id: string): Promise<void> {
    await this.destinationRepository.deleteDestination(id);
    await this.invalidateCache();
  }

  async toggleFeatured(id: string): Promise<DestinationResponseDto> {
    const destination = await this.destinationRepository.toggleFeatured(id);
    await this.invalidateCache();
    return DestinationMapper.toResponseDto(destination);
  }
}
