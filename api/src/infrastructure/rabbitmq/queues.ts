export const QUEUES = {
  EMAIL_OTP: "email_otp_queue",
  EMAIL_OTP_DLQ: "email_otp_dlq",
  BOOKING: "booking_processing_queue",
  EMAIL_BOOKING: "email_booking_queue",
} as const;

export type QueueType = (typeof QUEUES)[keyof typeof QUEUES];
