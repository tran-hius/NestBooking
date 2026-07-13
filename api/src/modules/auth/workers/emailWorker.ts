import { EmailService } from "@/modules/auth/services/emailService";
import { Transporter } from "@/modules/auth/config/transporter";
import logger from "@/utils/logger";
import { rabbitMQ } from "@/infrastructure/rabbitmq";
import { QUEUES } from "@/infrastructure/rabbitmq/queues";
import { EmailOtpPayload } from "@/modules/auth/queue/EmailOtpPayload";

const transporter = Transporter.transporter;
const emailService = new EmailService(transporter);

const MAX_RETRY = 3;

export const startEmailWorker = async (): Promise<void> => {
  logger.info(`Email Worker đang lắng nghe Queue: ${QUEUES.EMAIL_OTP}`);

  await rabbitMQ.consumeQueue(QUEUES.EMAIL_OTP, async (msg) => {
    if (!msg) return;

    const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);

    let payload: EmailOtpPayload;

    try {
      payload = JSON.parse(msg.content.toString());

      if (!payload.to || !payload.otpCode) {
        throw new Error("Payload không hợp lệ.");
      }
    } catch (error) {
      logger.error("Payload RabbitMQ không hợp lệ.", error);
      
      rabbitMQ.nack(msg, false);

      return;
    }

    try {
      logger.info(
        `Đang gửi OTP tới ${payload.to} (Retry ${retries}/${MAX_RETRY})`,
      );

      await emailService.sendOtpEmail(payload.to, payload.otpCode);

      rabbitMQ.ack(msg);

      logger.info(`Đã gửi OTP thành công tới ${payload.to}`);
    } catch (error) {
      logger.error(`Lỗi gửi OTP tới ${payload.to}`, error);

      if (retries >= MAX_RETRY) {
        logger.error(
          `OTP tới ${payload.to} đã retry ${MAX_RETRY} lần. Message bị loại bỏ.`,
        );

        rabbitMQ.nack(msg, false);

        return;
      }

      logger.warn(`Retry lần ${retries + 1}/${MAX_RETRY} cho ${payload.to}`);

      await rabbitMQ.sendToQueue(QUEUES.EMAIL_OTP, payload, {
        headers: {
          "x-retries": retries + 1,
        },
      });

      rabbitMQ.ack(msg);
    }
  });
};
