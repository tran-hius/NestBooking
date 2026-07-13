import Redis from "ioredis";
import logger from "../utils/logger";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";

export const redisClient = new Redis({
  host: redisHost,
  port: 6379, 
});

redisClient.on("connect", () => {
  logger.info("[Redis] Kết nối thành công tới Redis server");
});

redisClient.on("error", (error) => {
  logger.error("[Redis] Lỗi kết nối Redis:", error);
});
