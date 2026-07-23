import logger from "./config/logger.js";
import { rabbitmq } from "./infrastructure/rabbitmq/rabbitMQ.js";
import { setupRabbitMQBindings } from "./infrastructure/rabbitmq/setup.js";
import { startEmailWorker, startBookingNotificationWorker } from "./modules/auth/workers/emailWorker.js";
import { startBookingWorker } from "./modules/booking/workers/BookingWorker.js";
const bootstrapWorker = async () => {
    try {
        logger.info("Đang khởi chạy worker process");
        logger.info("Setting up RabbitMQ Bindings...");
        await setupRabbitMQBindings();
        logger.info("Starting Workers...");
        await startEmailWorker();
        await startBookingWorker();
        await startBookingNotificationWorker();
        const shutdown = async (signal) => {
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
    }
    catch (error) {
        logger.error("Lỗi khởi chạy Worker Process:", { error });
        process.exit(1);
    }
};
bootstrapWorker();
