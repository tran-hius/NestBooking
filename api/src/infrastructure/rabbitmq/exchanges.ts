export const EXCHANGES = {
  NOTIFICATION_DIRECT: "notification_direct_exchange",
  NOTIFICATION_DLX: "notification.dlx",
  BOOKING: "booking_exchange",
} as const;

export type ExchangeName = (typeof EXCHANGES)[keyof typeof EXCHANGES];
