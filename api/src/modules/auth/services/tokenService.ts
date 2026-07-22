import jwt from "jsonwebtoken";
import { ITokenService } from "@/modules/auth/interfaces/ITokenService";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ConflictError } from "@/utils/errors/errorCustomize";


export class TokenService implements ITokenService{
    private readonly JWT_SECRET = process.env.JWT_SECRET || "bi_mat_nhe"

    async hashPassword(password: string): Promise<string> {
        const salt = 10;
        return bcrypt.hash(password, salt)
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    generateAuthTokens(userId: string, role: string, status: string){
        const accessToken = jwt.sign(
            {userId, role, status},
            this.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || "30m"}
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");

        const tokenHash = this.hashToken(refreshToken);

        return {accessToken, refreshToken, tokenHash}
    }

    hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
    
    verifyRefreshToken(token: string) {
        if(!token){
            throw new ConflictError("RefreshToken không hợp lệ hoặc đã bị chỉnh sửa")
        }
        return true;
    }
}