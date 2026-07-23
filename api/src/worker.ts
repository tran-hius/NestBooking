import logger from "./config/logger";
import { rabbitmq } from "./infrastructure/rabbitmq/rabbitMQ";
import { setupRabbitMQBindings } from "./infrastructure/rabbitmq/setup";
import { startEmailWorker } from "./modules/auth/workers/emailWorker";
import { startBookingWorker } from "./modules/booking/workers/BookingWorker";


const bootstrapWorker = async () => {
  try {
    logger.info("Đang khởi chạy worker process");

    await rabbitmq.connect();
    await setupRabbitMQBindings();

    logger.info("Worker Process đang lắng nghe Queue liên tục...");

    await startEmailWorker();
    await startBookingWorker();

    const shutdown = async (signal: string) => {
      logger.info(`Nhận tín hiệu ${signal}. Đang đóng Worker process...`);
      const forceExit = setTimeout(() => {
        logger.error("Forcing shutdown worker do hết timeout (10s)...");
        process.exit(1);
      }, 10000).unref();

      await rabbitmq.close();
      clearTimeout(forceExit);
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Lỗi khởi chạy Worker Process:", { error });
    process.exit(1);
  }
};

bootstrapWorker();
