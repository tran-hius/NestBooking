export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
  },
  HOTEL: {
    LIST: '/hotels',
    DETAIL: (id: string) => `/hotels/${id}`,
  }
};
