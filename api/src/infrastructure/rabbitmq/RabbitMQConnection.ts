import * as amqp from "amqplib";
import logger from "@/utils/logger";
import { ServiceUnavailableError } from "@/utils/errors/errorCustomize";
import { env } from "@/config/env";
const RABBITMQ_URL = env.RABBITMQ_URL;

export interface QueueOptions {
  headers?: Record<string, any>;
}

class RabbitMQConnection {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private readonly url = RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);

      this.channel = await this.connection.createChannel();

      logger.info("RabbitMQ Connected");

      await this.channel.assertQueue("email_otp_queue", {
        durable: true,
      });
    } catch (error) {
      logger.error("RabbitMQ Connection Error:", error);
      process.exit(1);
    }
  }

  private getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new ServiceUnavailableError("RabbitMQ Channel chưa được khởi tạo.");
    }

    return this.channel;
  }

  async sendToQueue<T>(
    queueName: string,
    data: T,
    options?: QueueOptions,
  ): Promise<void> {
    const channel = this.getChannel();

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
      headers: options?.headers,
    });
  }

  async consumeQueue(
    queueName: string,
    onMessage: (msg: amqp.ConsumeMessage | null) => void,
  ): Promise<void> {
    const channel = this.getChannel();

    await channel.prefetch(1);

    await channel.consume(queueName, onMessage, {
      noAck: false,
    });
  }

  ack(msg: amqp.ConsumeMessage): void {
    this.getChannel().ack(msg);
  }

  nack(msg: amqp.ConsumeMessage, requeue = true): void {
    this.getChannel().nack(msg, false, requeue);
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        logger.info("Đã đóng Channel RabbitMQ.");
      }
      if (this.connection) {
        await this.connection.close();
        logger.info("Đã đóng Connection RabbitMQ.");
      }
    } catch (error) {
      logger.error("Lỗi khi đóng kết nối RabbitMQ:", error);
    }
  }
}

export default RabbitMQConnection;


// Trong hàm connect(), bạn đang gọi this.channel.assertQueue("email_otp_queue", ...). Việc khởi tạo cứng (hardcode) tên queue "email_otp_queue" ngay khi kết nối như thế này hoàn toàn ổn nếu service này chỉ phục vụ cho việc gửi OTP.

// Tuy nhiên, nếu sau này bạn muốn dùng class này cho nhiều mục đích khác nữa (ví dụ: order_queue, notification_queue), bạn nên cân nhắc tách hàm assertQueue ra ngoài hoặc truyền queueName động vào lúc khởi tạo nhé!