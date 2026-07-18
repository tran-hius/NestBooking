import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/utils/errors/errorCustomize";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "bi_mat_nhe";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: string;
      status: string;
    };
  }
}

export const requireOwnershipOrAdmin  = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {id} = req.params;

    if(req.user?.role !== Role.ADMIN && req.user?.userId !== id){
        return next(
          new UnauthorizedError(
            "Bạn không có quyền thao tác trên tài khoản của người khác.",
          ),
        );
    }
    next();
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError("Bạn chưa đăng nhập hoặc thiếu Access Token");
    }

    // Xóa dấu nháy kép thừa nếu người dùng vô tình copy dính vào từ Swagger
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      status: string;
    };

    req.user = decoded;

    next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message);
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new UnauthorizedError(
          "Phiên đăng nhập đã hết hạn. Vui lòng lấy Token mới.",
        ),
      );
    } else {
      next(new UnauthorizedError(`Token không hợp lệ hoặc đã bị giả mạo. Chi tiết: ${error.message}`));
    }
  }
};
