import { EmailService } from "@/modules/auth/services/emailService";
import { Transporter } from "@/config/transporter";
import logger from "@/config/logger";
import { rabbitmq } from "@/infrastructure/rabbitmq/rabbitMQ"; // <-- Dùng instance mới
import { QUEUES } from "@/infrastructure/rabbitmq/queues";
import { EXCHANGES } from "@/infrastructure/rabbitmq/exchanges";
import { ROUTING_KEYS } from "@/infrastructure/rabbitmq/routing.key";
import { EmailOtpPayload } from "@/modules/auth/queue/EmailOtpPayload";

const transporter = Transporter.transporter;
const emailService = new EmailService(transporter);

const MAX_RETRY = 3;

export const startEmailWorker = async (): Promise<void> => {
  logger.info(`Email Worker đang lắng nghe Queue: ${QUEUES.EMAIL_OTP}`);

  // THAY ĐỔI: Thêm tham số channel vào callback để tương tác với RabbitMQ
  await rabbitmq.consumeQueue(QUEUES.EMAIL_OTP, async (msg, channel) => {
    if (!msg) {
      logger.warn("Nhận được message rỗng.");
      return;
    }

    const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);
    let payload: EmailOtpPayload;

    try {
      payload = JSON.parse(msg.content.toString());

      if (!payload.to || !payload.otpCode) {
        throw new Error("Payload không hợp lệ.");
      }
    } catch (error) {
      logger.error("Payload RabbitMQ không hợp lệ.", error);

      // THAY ĐỔI: Nack với requeue = false -> Tự động rớt vào Dead Letter Queue
      channel.nack(msg, false, false);
      return;
    }

    try {
      logger.info(
        `Đang gửi OTP tới ${payload.to} (Retry ${retries}/${MAX_RETRY})`,
      );

      await emailService.sendOtpEmail(payload.to, payload.otpCode);

      // Báo thành công
      channel.ack(msg);

      logger.info(`Đã gửi OTP thành công tới ${payload.to}`);
    } catch (error) {
      logger.error(`Lỗi gửi OTP tới ${payload.to}`, error);

      if (retries >= MAX_RETRY) {
        logger.error(
          `OTP tới ${payload.to} đã retry ${MAX_RETRY} lần. Đẩy message vào DLQ.`,
        );

        // Hết lượt thử -> Chuyển vào DLQ
        channel.nack(msg, false, false);
        return;
      }

      logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho ${payload.to}`);

      const content = Buffer.from(JSON.stringify(payload));
      channel.publish(
        EXCHANGES.NOTIFICATION_DIRECT,
        ROUTING_KEYS.OTP_SEND,
        content,
        {
          headers: { "x-retries": retries + 1 },
          persistent: true,
        },
      );

      channel.ack(msg);
    }
  });
};
