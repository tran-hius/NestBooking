import jwt from "jsonwebtoken";
import { ITokenService } from "@/modules/auth/interfaces/ITokenService";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AUTH_CONSTANTS } from "@/utils/constants";
import { ConflictError } from "@/utils/errors/errorCustomize";
import { env } from "@/config/env";


export class TokenService implements ITokenService{
    private readonly JWT_SECRET = env.JWT_SECRET;
    private readonly JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(AUTH_CONSTANTS.SALT_ROUNDS);
        return bcrypt.hash(password, salt)
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    generateAuthTokens(userId: string, role: string, status: string){
        const accessToken = jwt.sign(
            {userId, role, status},
            this.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
        );

        const refreshToken = jwt.sign(
            {userId, role, status},
            this.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const tokenHash = this.hashToken(refreshToken);

        return {accessToken, refreshToken, tokenHash}
    }

    hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    verifyRefreshToken(token: string): jwt.JwtPayload | string {
        try {
            return jwt.verify(token, this.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new ConflictError("RefreshToken không hợp lệ hoặc đã hết hạn.");
        }
    }
}