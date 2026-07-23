export const REDIS_TTL = {
    /**
     * OTP
     */
    OTP: 5 * 60,
    /**
     * Login Attempt
     */
    LOGIN_ATTEMPT: 5,
    /**
     * User Session
     */
    SESSION: 7 * 24 * 60 * 60,
    /**
     * Blacklist Refresh Token
     */
    BLACKLIST_TOKEN: 7 * 24 * 60 * 60,
    /**
     * Cache Hotel
     */
    HOTEL: 30 * 60,
    /**
     * Cache RoomType
     */
    ROOM_TYPE: 30 * 60,
    /**
     * Cache Room
     */
    ROOM: 30 * 60,
    /**
     * Booking Cache
     */
    BOOKING: 10 * 60,
    /**
     * Wishlist Cache
     */
    WISHLIST: 60 * 60,
    /**
     * Rate Limit
     */
    RATE_LIMIT: 60,
};
