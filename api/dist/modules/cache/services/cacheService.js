import { redisClient } from "../../../infrastructure/redis/index.js";
import logger from "../../../config/logger.js";
export class CacheService {
    async get(key) {
        try {
            const data = await redisClient.get(key);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (error) {
            logger.error(`[CacheService] Lỗi khi get key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const stringValue = JSON.stringify(value);
            if (ttlSeconds) {
                await redisClient.set(key, stringValue, "EX", ttlSeconds);
            }
            else {
                await redisClient.set(key, stringValue);
            }
        }
        catch (error) {
            logger.error(`[CacheService] Lỗi khi set key ${key}:`, error);
        }
    }
    async delete(key) {
        try {
            await redisClient.del(key);
        }
        catch (error) {
            logger.error(`[CacheService] Lỗi khi delete key ${key}:`, error);
        }
    }
    async deleteMultiple(keys) {
        if (keys.length === 0)
            return;
        try {
            await redisClient.del(...keys);
        }
        catch (error) {
            logger.error(`[CacheService] Lỗi khi deleteMultiple keys:`, error);
        }
    }
    async deletePattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        }
        catch (error) {
            logger.error(`[CacheService] Lỗi khi deletePattern ${pattern}:`, error);
        }
    }
}
