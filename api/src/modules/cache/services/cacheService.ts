import { ICacheService } from "../interfaces/iCacheService";
import { redisClient } from "@/infrastructure/redis";
import logger from "@/config/logger";

export class CacheService implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`[CacheService] Lỗi khi get key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.set(key, stringValue, "EX", ttlSeconds);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`[CacheService] Lỗi khi set key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`[CacheService] Lỗi khi delete key ${key}:`, error);
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redisClient.del(...keys);
    } catch (error) {
      logger.error(`[CacheService] Lỗi khi deleteMultiple keys:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`[CacheService] Lỗi khi deletePattern ${pattern}:`, error);
    }
  }
}
