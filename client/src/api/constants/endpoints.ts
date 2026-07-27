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
    ALL: "/users",
    UPLOAD_AVATAR: (id: string) => `/users/${id}/avatar`,
    UPDATE_PROFILE: (id: string) => `/users/${id}/profile`,
  },
  SEARCH: {
    HOTELS: "/search/hotels",
  },
  BOOKINGS: {
    ME: "/bookings/me",
    ALL: "/bookings",
    DETAIL: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    CONFIRM: (id: string) => `/bookings/${id}/confirm`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
  },
  PAYMENTS: {
    ALL: "/payments",
    DETAIL: (id: string) => `/payments/${id}`,
  },
  REVIEWS: {
    ALL: "/reviews",
    APPROVE: (id: string) => `/reviews/${id}/approve`,
    SPAM: (id: string) => `/reviews/${id}/spam`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  REPORTS: {
    ALL: "/reports",
    RESOLVE: (id: string) => `/reports/${id}/resolve`,
    REJECT: (id: string) => `/reports/${id}/reject`,
  },
  AGENTS: {
    ALL: "/agents",
    APPROVE: (id: string) => `/agents/${id}/approve`,
    REJECT: (id: string) => `/agents/${id}/reject`,
    SUSPEND: (id: string) => `/agents/${id}/suspend`,
  }
};
