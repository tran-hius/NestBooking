import { env } from "./config/env.js";
import app from "./app.js";
import logger from "./config/logger.js";
import { redisConnection } from "./infrastructure/redis/RedisConnection.js";
import { prisma } from "./config/prisma.js";
import { SchedulerService } from "./modules/scheduler/services/schedulerService.js";
const bootstrap = async () => {
    try {
        await prisma.$connect();
        const schedulerService = new SchedulerService();
        schedulerService.init();
        const server = app.listen(env.PORT || 3000, () => {
            logger.info(`Booking API Service đang chạy tại port ${env.PORT || 3000} (Môi trường: ${env.NODE_ENV})`);
        });
        let isShuttingDown = false;
        const shutdown = async (signal) => {
            if (isShuttingDown)
                return;
            isShuttingDown = true;
            logger.info(`Nhận tín hiệu ${signal}. Đang đóng API Server...`);
            const timer = setTimeout(() => {
                logger.error("Forcing shutdown do hết timeout (10s)...");
                process.exit(1);
            }, 10000);
            timer.unref();
            try {
                await new Promise((resolve) => server.close(resolve));
                logger.info("Express HTTP server đã đóng.");
                await redisConnection.disconnect();
                await prisma.$disconnect();
                logger.info("Tất cả kết nối đã đóng an toàn. Process exit.");
                process.exit(0);
            }
            catch (err) {
                logger.error("Lỗi khi đóng tài nguyên:", err);
                process.exit(1);
            }
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("unhandledRejection", (reason) => {
            logger.error("Unhandled Rejection:", reason);
            shutdown("unhandledRejection");
        });
        process.on("uncaughtException", (error) => {
            logger.error("Uncaught Exception:", error);
            shutdown("uncaughtException");
        });
    }
    catch (error) {
        logger.error("Không thể khởi động Booking API:", { error });
        process.exit(1);
    }
};
bootstrap();
