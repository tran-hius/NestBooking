import { ApiError } from "../utils/errors/apiError.js";
import { env as appEnv } from "../config/env.js";
import logger from "../config/logger.js";
import { Prisma } from "#generated/prisma";
export const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Internal server error";
    let errors = null;
    logger.error(`GLOBAL ERROR HANDLER CAUGHT: ${error.stack || error.message || error}`);
    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors || null;
    }
    else if (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025") {
        statusCode = 404;
        message =
            "Bản ghi không tồn tại hoặc bạn không có quyền thực hiện hành động này.";
    }
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        stack: appEnv.NODE_ENV === "development" ? error.stack : undefined,
    });
};
