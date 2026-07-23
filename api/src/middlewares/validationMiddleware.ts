import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod/v3";
import { ApiError } from "@/utils/errors/apiError";

export const validate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: unknown };

      // 1. Cập nhật body và params (Có thể gán trực tiếp an toàn)
      req.body = parsed.body || req.body;
      req.params = (parsed.params as any) || req.params;

      // 2. Cập nhật query một cách AN TOÀN bằng Object.assign
      if (parsed.query) {
        // Xóa các key cũ để tránh dữ liệu thừa không qua validate lọt vào
        for (const key in req.query) {
          delete req.query[key];
        }
        // Copy các key đã validate vào object req.query hiện tại
        Object.assign(req.query, parsed.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.slice(1).join("."),
          message: err.message,
        }));

        next(
          new ApiError(400, "Dữ liệu gửi lên không hợp lệ.", formattedErrors),
        );
      } else {
        next(error);
      }
    }
  };
};
