import { env } from "@/config/env.js";
import { rabbitMQ } from "@/infrastructure/rabbitmq/index.js";
import { startEmailWorker } from "@/modules/auth/workers/emailWorker";
import app from "@/app.js";
import logger from "@/utils/logger.js";

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

const startServer = async () => {
  try {
    await rabbitMQ.connect();

    await startEmailWorker();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} env ${NODE_ENV}`);
    });

    process.on("SIGINT", async () => {
      logger.info("Đang tắt Server...");

      try {
        server.close(async () => {
          logger.info("HTTP Server đã đóng.");

          await rabbitMQ.close();

          logger.info("RabbitMQ đã đóng.");

          process.exit(0);
        });
      } catch (error) {
        logger.error("Lỗi khi shutdown:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Lỗi khởi động Server:", error);
    process.exit(1);
  }
};

void startServer();