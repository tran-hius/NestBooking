import { REDIS_KEYS } from "../../../infrastructure/redis/index.js";
import { CacheService } from "../../../modules/cache/services/cacheService.js";
const cacheService = new CacheService();
export class UserCacheHelper {
    static async clearUserCache(userId, email) {
        const keysToDelete = [REDIS_KEYS.USER_PROFILE(userId)];
        if (email) {
            keysToDelete.push(REDIS_KEYS.USER_BY_EMAIL(email.toLowerCase().trim()));
        }
        await cacheService.deleteMultiple(keysToDelete);
    }
}
