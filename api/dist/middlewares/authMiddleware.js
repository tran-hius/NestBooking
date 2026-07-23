import { NotFoundError, UnauthorizedError } from "../utils/errors/errorCustomize.js";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/index.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
const JWT_SECRET = env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new NotFoundError("Invalid jwt secret");
}
export const requireOwnershipOrAdmin = (req, res, next) => {
    const { id } = req.params;
    if (req.user?.role !== Role.ADMIN && req.user?.userId !== id) {
        return next(new UnauthorizedError("Bạn không có quyền thao tác trên tài khoản của người khác."));
    }
    next();
};
export const authMiddleware = (req, res, next) => {
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
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const err = error;
        logger.error(`JWT Verification Error: ${err.message}`);
        if (err instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError("Phiên đăng nhập đã hết hạn. Vui lòng lấy Token mới."));
        }
        else {
            next(new UnauthorizedError(`Token không hợp lệ hoặc đã bị giả mạo. Chi tiết: ${err.message}`));
        }
    }
};
