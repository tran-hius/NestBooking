import { redisClient } from "@/infrastructure/redis";
import logger from "@/config/logger";
import { randomBytes } from "crypto";
import { IBookingLockService } from "../../interfaces/iBookingLockService";

const LOCK_PREFIX = "booking_lock:";
const DEFAULT_TTL_MS = 60000; // 60s
const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_DELAY_MS = 200;

export class BookingLockService implements IBookingLockService {
  /**
   * Cố gắng lấy lock cho một roomTypeId trong khoảng thời gian nhất định (mặc định 60s)
   */
  async acquireLock(roomTypeId: string, ttlMs: number = DEFAULT_TTL_MS): Promise<string | null> {
    const lockKey = `${LOCK_PREFIX}${roomTypeId}`;
    const lockValue = randomBytes(16).toString("hex");

    try {
      const result = await redisClient.set(lockKey, lockValue, "PX", ttlMs, "NX");

      if (result === "OK") {
        return lockValue;
      }
      return null;
    } catch (error) {
      logger.error(`[BookingLockService] Lỗi Redis khi acquire lock cho ${roomTypeId}: ${error}`);
      // Fail-open policy: nếu Redis sập, cho phép đi tiếp để không block user (rủi ro overbooking nhỏ chấp nhận được)
      return "fallback-lock-bypass"; 
    }
  }

  /**
   * Giải phóng lock bằng Lua script để đảm bảo chỉ người giữ lock mới được xóa
   */
  async releaseLock(roomTypeId: string, lockValue: string): Promise<boolean> {
    if (lockValue === "fallback-lock-bypass") return true;

    const lockKey = `${LOCK_PREFIX}${roomTypeId}`;
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await redisClient.eval(luaScript, 1, lockKey, lockValue);
      return result === 1;
    } catch (error) {
      logger.error(`[BookingLockService] Lỗi Redis khi release lock cho ${roomTypeId}: ${error}`);
      return false; // Trả về false thay vì throw để không ảnh hưởng luồng chính
    }
  }

  /**
   * Helper function để block và chờ lấy lock, thử lại nhiều lần
   */
  async acquireLockWithRetry(
    roomTypeId: string,
    ttlMs: number = DEFAULT_TTL_MS,
    maxRetries: number = DEFAULT_MAX_RETRIES,
    retryDelayMs: number = DEFAULT_RETRY_DELAY_MS
  ): Promise<string | null> {
    for (let i = 0; i < maxRetries; i++) {
      const lockValue = await this.acquireLock(roomTypeId, ttlMs);
      if (lockValue) return lockValue;
      
      await new Promise(res => setTimeout(res, retryDelayMs));
    }
    return null;
  }
}
