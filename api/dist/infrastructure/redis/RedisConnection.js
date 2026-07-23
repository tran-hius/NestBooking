import Redis from "ioredis";
import logger from "../../config/logger.js";
import { env } from "../../config/env.js";
const REDIS_HOST = env.REDIS_HOST;
const REDIS_PORT = env.REDIS_PORT;
export class RedisConnection {
    client;
    constructor() {
        this.client = new Redis({
            host: REDIS_HOST || "127.0.0.1",
            port: REDIS_PORT || 6379,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                logger.warn(`[Redis] Đang thử kết nối lại lần ${times}... (delay: ${delay}ms)`);
                return delay;
            }
        });
        this.client.on("connect", () => {
            logger.info("[Redis] Kết nối thành công tới Redis server");
        });
        this.client.on("error", (error) => {
            logger.error("[Redis] Lỗi kết nối Redis:", error);
        });
        // Graceful Shutdown
        process.on("SIGINT", async () => {
            await this.disconnect();
        });
        process.on("SIGTERM", async () => {
            await this.disconnect();
        });
    }
    getClient() {
        return this.client;
    }
    async disconnect() {
        await this.client.quit();
        logger.info("[Redis] Đã đóng kết nối Redis");
    }
}
export const redisConnection = new RedisConnection();
export const redisClient = redisConnection.getClient();
