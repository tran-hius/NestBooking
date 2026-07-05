import { env } from "./config/env.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = env.PORT
const NODE_ENV = env.NODE_ENV

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} env ${NODE_ENV}`);
});

process.on("SIGINT", () => {
    server.close(() =>   logger.info("Server đã tắt hoàn toàn"));
})