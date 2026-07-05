import winston from "winston";
import { env } from "../config/env";

const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
    ]
})

export default logger