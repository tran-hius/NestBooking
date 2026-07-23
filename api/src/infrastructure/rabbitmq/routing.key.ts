export const ROUTING_KEYS = {
  OTP_SEND: "notification.otp.send",
  NOTIFICATION_DEAD_LETTER: "notification.dead_letter",
  BOOKING_CREATE: "booking.create",
  EMAIL_BOOKING_SUCCESS: "notification.email.booking_success",
  EMAIL_BOOKING_FAIL: "notification.email.booking_fail",
} as const;

export type RoutingKeyType = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];
