export const REDIS_KEYS = {
  /**
   * OTP
   */
  OTP: (email: string) => `otp:${email}`,

  /**
   * Login
   */
  LOGIN_ATTEMPT: (email: string) => `login_attempt:${email}`,

  /**
   * User Session
   */
  USER_SESSION: (userId: string) => `session:${userId}`,

  /**
   * Refresh Token Blacklist
   */
  BLACKLIST_TOKEN: (tokenId: string) => `blacklist:${tokenId}`,

  /**
   * Hotel Cache
   */
  HOTEL: (hotelId: string) => `hotel:${hotelId}`,

  HOTEL_LIST: "hotel:list",

  /**
   * Room Cache
   */
  ROOM: (roomId: string) => `room:${roomId}`,

  /**
   * Booking
   */
  BOOKING: (bookingId: string) => `booking:${bookingId}`,

  /**
   * Wishlist
   */
  WISHLIST: (userId: string) => `wishlist:${userId}`,

  /**
   * Rate Limit
   */
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
} as const;
