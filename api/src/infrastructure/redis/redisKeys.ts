export const REDIS_KEYS = {
  /**
   * OTP
   */
  OTP: (otpToken: string) => `otp:${otpToken}`,

  /**
   * Login
   */
  LOGIN_ATTEMPT: (email: string) => `login_attempt:${email}`,

  /**
   * User Session
   */
  USER_SESSION: (userId: string) => `session:${userId}`,

  /**
   * User Profile
   */
  USER_PROFILE: (userId: string) => `user_profile:${userId}`,

  USER_BY_EMAIL: (email: string) => `user_email:${email}`,

  /**
   * Refresh Token Blacklist
   */
  BLACKLIST_TOKEN: (tokenId: string) => `blacklist:${tokenId}`,

  /**
   * Hotel Cache
   */
  HOTEL: (hotelId: string) => `hotel:${hotelId}`,
  /**
   * Room Cache
   */
  HOTEL_LIST: "hotel:list",
  HOTEL_LIST_QUERY: (queryHash: string) => `hotel_list:${queryHash}`,

  /**
   * Room Type Cache
   */
  ROOM_TYPE: (roomTypeId: string) => `room_type:${roomTypeId}`,
  ROOM_TYPES_BY_HOTEL: (hotelId: string) => `room_types:hotel:${hotelId}`,
  PUBLIC_ROOM_TYPES_BY_HOTEL: (hotelId: string) => `public_room_types:hotel:${hotelId}`,

  /**
   * Room Cache
   */
  ROOM: (roomId: string) => `room:${roomId}`,
  ROOMS_BY_HOTEL: (hotelId: string) => `rooms:hotel:${hotelId}`,
  ROOMS_BY_ROOM_TYPE: (roomTypeId: string) => `rooms:room_type:${roomTypeId}`,

  /**
   * Booking
   */
  BOOKING: (bookingId: string) => `booking:${bookingId}`,
  USER_BOOKINGS: (userId: string) => `user_bookings:${userId}`,
  HOTEL_BOOKINGS: (hotelId: string) => `hotel_bookings:${hotelId}`,

  /**
   * Wishlist
   */
  WISHLIST: (userId: string) => `wishlist:${userId}`,

  /**
   * Rate Limit
   */
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
} as const;
