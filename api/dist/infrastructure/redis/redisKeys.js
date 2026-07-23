export const REDIS_KEYS = {
    /**
     * OTP
     */
    OTP: (otpToken) => `otp:${otpToken}`,
    /**
     * Login
     */
    LOGIN_ATTEMPT: (email) => `login_attempt:${email}`,
    /**
     * User Session
     */
    USER_SESSION: (userId) => `session:${userId}`,
    /**
     * User Profile
     */
    USER_PROFILE: (userId) => `user_profile:${userId}`,
    USER_BY_EMAIL: (email) => `user_email:${email}`,
    /**
     * Refresh Token Blacklist
     */
    BLACKLIST_TOKEN: (tokenId) => `blacklist:${tokenId}`,
    /**
     * Hotel Cache
     */
    HOTEL: (hotelId) => `hotel:${hotelId}`,
    /**
     * Room Cache
     */
    HOTEL_LIST: "hotel:list",
    HOTEL_LIST_QUERY: (queryHash) => `hotel_list:${queryHash}`,
    /**
     * Room Type Cache
     */
    ROOM_TYPE: (roomTypeId) => `room_type:${roomTypeId}`,
    ROOM_TYPES_BY_HOTEL: (hotelId) => `room_types:hotel:${hotelId}`,
    PUBLIC_ROOM_TYPES_BY_HOTEL: (hotelId) => `public_room_types:hotel:${hotelId}`,
    /**
     * Room Cache
     */
    ROOM: (roomId) => `room:${roomId}`,
    ROOMS_BY_HOTEL: (hotelId) => `rooms:hotel:${hotelId}`,
    ROOMS_BY_ROOM_TYPE: (roomTypeId) => `rooms:room_type:${roomTypeId}`,
    /**
     * Booking
     */
    BOOKING: (bookingId) => `booking:${bookingId}`,
    USER_BOOKINGS: (userId) => `user_bookings:${userId}`,
    HOTEL_BOOKINGS: (hotelId) => `hotel_bookings:${hotelId}`,
    /**
     * Wishlist
     */
    WISHLIST: (userId) => `wishlist:${userId}`,
    /**
     * Rate Limit
     */
    RATE_LIMIT: (ip) => `rate_limit:${ip}`,
};
