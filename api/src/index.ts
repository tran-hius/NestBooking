import { env } from "@/config/env";
import app from "@/app";
import { rabbitmq } from "@/infrastructure/rabbitmq/rabbitMQ";
import logger from "@/config/logger";
import { setupRabbitMQBindings } from "@/infrastructure/rabbitmq/setup";

const bootstrap = async () => {
  try {
    await rabbitmq.connect();
    await setupRabbitMQBindings();

    const server = app.listen(env.PORT || 3000, () => {
      logger.info(
        `Booking API Service đang chạy tại port ${env.PORT || 3000} (Môi trường: ${env.NODE_ENV})`,
      );
    });

    const shutdown = async (signal: string) => {
      logger.info(`Nhận tín hiệu ${signal}. Đang đóng API Server...`);

      server.close(async () => {
        logger.info("Express HTTP server đã đóng.");

        await rabbitmq.close();

        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forcing shutdown do hết timeout (10s)...");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Không thể khởi động Booking API:", { error });
    process.exit(1);
  }
};

bootstrap();
