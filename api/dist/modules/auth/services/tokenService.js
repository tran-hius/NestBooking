import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AUTH_CONSTANTS } from "../../../utils/constants.js";
import { ConflictError } from "../../../utils/errors/errorCustomize.js";
import { env } from "../../../config/env.js";
export class TokenService {
    JWT_SECRET = env.JWT_SECRET;
    JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(AUTH_CONSTANTS.SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    }
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    generateAuthTokens(userId, role, status) {
        const accessToken = jwt.sign({ userId, role, status }, this.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        const refreshToken = jwt.sign({ userId, role, status }, this.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        const tokenHash = this.hashToken(refreshToken);
        return { accessToken, refreshToken, tokenHash };
    }
    hashToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new ConflictError("RefreshToken không hợp lệ hoặc đã hết hạn.");
        }
    }
}
