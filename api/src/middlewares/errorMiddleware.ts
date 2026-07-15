import { NextFunction, Request, Response } from "express";
import { ApiError } from "@/utils/errors/apiError";
import { env as appEnv } from "@/config/env";
import { Prisma } from "generated/prisma";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: any = null;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors || null;
  } else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
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
    ...(appEnv.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};
