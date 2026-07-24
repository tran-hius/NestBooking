export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
  HOTEL: {
    LIST: "/hotels",
    DETAIL: (id: string) => `/hotels/${id}`,
  },
  USER: {
    UPLOAD_AVATAR: (id: string) => `/users/${id}/avatar`,
    UPDATE_PROFILE: (id: string) => `/users/${id}/profile`,
  },
};
