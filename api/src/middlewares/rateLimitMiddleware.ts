import rateLimit from "express-rate-limit";

// Giới hạn chung cho toàn bộ hệ thống (Chống DDoS cơ bản)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests mỗi IP
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Giới hạn khắt khe dành riêng cho các API nhạy cảm (Auth, OTP)
export const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 phút
  max: 5, // Chỉ cho phép tối đa 5 requests gửi/xác thực OTP mỗi 15 phút
  message: {
    success: false,
    message: "Bạn đã thao tác đăng nhập/gửi OTP quá nhiều lần. Vui lòng chờ 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


