import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors/apiError";

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
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};
