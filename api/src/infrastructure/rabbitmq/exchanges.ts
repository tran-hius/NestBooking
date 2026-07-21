export const EXCHANGES = {
  NOTIFICATION_DIRECT: "notification_direct_exchange",
  NOTIFICATION_DLX: "notification.dlx",
} as const;

export type ExchangeName = (typeof EXCHANGES)[keyof typeof EXCHANGES];
