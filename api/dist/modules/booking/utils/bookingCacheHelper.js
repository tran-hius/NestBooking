import { REDIS_KEYS } from "../../../infrastructure/redis/index.js";
import logger from "../../../config/logger.js";
import { CacheService } from "../../../modules/cache/services/cacheService.js";
const cacheService = new CacheService();
export class BookingCacheHelper {
    static async clearBookingCache(bookingId, userId, hotelId) {
        try {
            const keys = [
                REDIS_KEYS.BOOKING(bookingId),
                REDIS_KEYS.USER_BOOKINGS(userId),
                REDIS_KEYS.HOTEL_BOOKINGS(hotelId),
            ];
            await cacheService.deleteMultiple(keys);
        }
        catch (error) {
            logger.error(`[BookingCacheHelper] Error clearing cache for booking ${bookingId}: ${error}`);
        }
    }
}
