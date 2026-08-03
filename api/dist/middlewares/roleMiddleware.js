import { UnauthorizedError } from "@/utils/errors/errorCustomize";
export const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new UnauthorizedError("Bạn chưa đăng nhập hoặc thiếu thông tin quyền hạn"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new UnauthorizedError("Bạn không có quyền truy cập vào tính năng này."));
        }
        next();
    };
};
