export const ROUTING_KEYS = {
  OTP_SEND: "notification.otp.send",
  NOTIFICATION_DEAD_LETTER: "notification.dead_letter",
  BOOKING_CREATE: "booking.create",
} as const;

export type RoutingKeyType = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];
