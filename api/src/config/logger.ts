import winston from "winston";
import "winston-daily-rotate-file";
import { env } from "@/config/env";

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
        fileRotateTransport,
    ]
})

export default logger