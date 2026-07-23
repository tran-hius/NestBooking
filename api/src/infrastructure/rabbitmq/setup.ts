import { rabbitmq } from "./rabbitMQ";
import { EXCHANGES } from "./exchanges";
import { QUEUES } from "./queues";
import { ROUTING_KEYS } from "./routing.key";
import logger from "@/config/logger";

export async function setupRabbitMQBindings(): Promise<void> {
  await rabbitmq.connect();

  const channel = await rabbitmq.createChannel();

  try {
    await channel.assertExchange(EXCHANGES.NOTIFICATION_DIRECT, "direct", {
      durable: true,
    });
    await channel.assertExchange(EXCHANGES.NOTIFICATION_DLX, "direct", {
      durable: true,
    });

    await channel.assertQueue(QUEUES.EMAIL_OTP_DLQ, { durable: true });
    await channel.bindQueue(
      QUEUES.EMAIL_OTP_DLQ,
      EXCHANGES.NOTIFICATION_DLX,
      ROUTING_KEYS.NOTIFICATION_DEAD_LETTER,
    );

    await channel.assertQueue(QUEUES.EMAIL_OTP, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": EXCHANGES.NOTIFICATION_DLX,
        "x-dead-letter-routing-key": ROUTING_KEYS.NOTIFICATION_DEAD_LETTER,
      },
    });

    await channel.bindQueue(
      QUEUES.EMAIL_OTP,
      EXCHANGES.NOTIFICATION_DIRECT,
      ROUTING_KEYS.OTP_SEND,
    );

    await channel.assertExchange(EXCHANGES.BOOKING, "direct", { durable: true });
    await channel.assertQueue(QUEUES.BOOKING, { durable: true });
    await channel.bindQueue(QUEUES.BOOKING, EXCHANGES.BOOKING, ROUTING_KEYS.BOOKING_CREATE);

    logger.info(
      "[RabbitMQ] Khai báo Exchanges, Queues, DLQ & Bindings hoàn tất!",
    );
  } finally {
    await channel.close();
  }
}
