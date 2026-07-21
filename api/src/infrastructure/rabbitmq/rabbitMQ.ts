import amqp from "amqplib";
import { env } from "@/config/env";
import logger from "@/config/logger";

declare module "amqplib" {
  interface Connection extends NodeJS.EventEmitter {
    createChannel(): Promise<Channel>;
    createConfirmChannel(): Promise<ConfirmChannel>;
    close(): Promise<void>;
  }
  export function connect(
    url: string | any,
    socketOptions?: any,
  ): Promise<Connection>;
}

class RabbitMQ {
  private connection: amqp.Connection | null = null;
  private publisherChannel: amqp.ConfirmChannel | null = null;
  private isConnecting: boolean = false;
  private consumers: { channel: amqp.Channel; consumerTag: string }[] = [];
  private registeredConsumers: {
    queue: string;
    onMessage: (
      msg: amqp.ConsumeMessage,
      channel: amqp.Channel,
    ) => Promise<void>;
    prefetchCount: number;
  }[] = [];

  async connect(): Promise<void> {
    if (this.connection) return;
    if (this.isConnecting) return;

    this.isConnecting = true;
    const maxRetry = 10;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        logger.info(`🔍 [RabbitMQ] Đang kết nối tới: "${env.RABBITMQ_URL}"`);
        this.connection = await amqp.connect(env.RABBITMQ_URL);

        this.publisherChannel = await this.connection.createConfirmChannel();

        logger.info("[RabbitMQ] Kết nối thành công!");

        this.connection.on("close", (err: any) => {
          logger.error("[RabbitMQ] Connection closed!", err);
          this.connection = null;
          this.publisherChannel = null;
          this.handleReconnect();
        });

        this.connection.on("error", (err: any) => {
          logger.error("[RabbitMQ] Connection error:", err);
        });

        this.isConnecting = false;
        return;
      } catch (error) {
        logger.error(`[RabbitMQ] Lần thử thứ ${attempt} thất bại:`, error);
        if (attempt === maxRetry) {
          this.isConnecting = false;
          throw new Error("Không thể kết nối RabbitMQ.");
        }
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  async createChannel(): Promise<amqp.Channel> {
    if (!this.connection) {
      await this.connect();
    }
    return await this.connection!.createChannel();
  }

  private handleReconnect() {
    // Clear old consumers tracking to prevent memory leak and duplicate consumption
    if (this.consumers.length > 0) {
      logger.info(
        `[RabbitMQ] Dọn dẹp ${this.consumers.length} consumers cũ trước khi reconnect...`,
      );
      for (const { channel, consumerTag } of this.consumers) {
        try {
          channel.cancel(consumerTag).catch(() => {});
          channel.close().catch(() => {});
        } catch (error) {
          // Ignore close errors on dead channels
        }
      }
      this.consumers = [];
    }

    setTimeout(() => {
      logger.info("🔄 [RabbitMQ] Đang thử kết nối lại...");
      this.connect()
        .then(async () => {
          logger.info("🔄 [RabbitMQ] Khôi phục bindings sau reconnect...");
          const { setupRabbitMQBindings } = await import("./setup");
          await setupRabbitMQBindings();

          if (this.registeredConsumers.length > 0) {
            logger.info(
              `🔄 [RabbitMQ] Đang khởi động lại ${this.registeredConsumers.length} consumer(s)...`,
            );
            for (const consumer of this.registeredConsumers) {
              await this.consumeQueue(
                consumer.queue,
                consumer.onMessage,
                consumer.prefetchCount,
              );
            }
          }
        })
        .catch((err) => logger.error("[RabbitMQ] Reconnect thất bại:", err));
    }, 5000);
  }

  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: object,
  ): Promise<void> {
    if (!this.publisherChannel) {
      throw new Error("RabbitMQ Publisher Channel chưa được khởi tạo!");
    }

    const content = Buffer.from(JSON.stringify(message));
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      this.publisherChannel!.publish(
        exchange,
        routingKey,
        content,
        {
          persistent: true,
          timestamp: Date.now(),
          messageId: msgId,
          correlationId: msgId,
        },
        (err, ok) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async consumeQueue(
    queue: string,
    onMessage: (
      msg: amqp.ConsumeMessage,
      channel: amqp.Channel,
    ) => Promise<void>,
    prefetchCount = 1,
  ): Promise<void> {
    const isRegistered = this.registeredConsumers.some(
      (c) => c.queue === queue && c.onMessage === onMessage,
    );
    if (!isRegistered) {
      this.registeredConsumers.push({ queue, onMessage, prefetchCount });
    }

    const channel = await this.createChannel();
    await channel.prefetch(prefetchCount);

    const { consumerTag } = await channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          await onMessage(msg, channel);
        }
      },
      { noAck: false },
    );

    this.consumers.push({ channel, consumerTag });
  }

  async close(): Promise<void> {
    try {
      if (this.publisherChannel) await this.publisherChannel.close();
      if (this.connection) await this.connection.close();
      logger.info("[RabbitMQ] Đã đóng kết nối an toàn.");
    } catch (err) {
      logger.error("[RabbitMQ] Lỗi khi đóng kết nối:", err);
    }
  }
}

export const rabbitmq = new RabbitMQ();
