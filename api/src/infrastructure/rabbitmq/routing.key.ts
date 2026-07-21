export const ROUTING_KEYS = {
  OTP_SEND: "notification.otp.send", 
  NOTIFICATION_DEAD_LETTER: "notification.dead_letter", 
} as const;

export type RoutingKeyType = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];
