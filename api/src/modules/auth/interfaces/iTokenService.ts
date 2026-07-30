import { AuthResponseDto, AuthTokensDto } from "@/modules/auth/dtos/authDto";
import { JwtPayload } from "jsonwebtoken";

export interface ITokenService {
    hashPassword(password: string): Promise<string>
    comparePassword(password: string, hash: string): Promise<boolean>
    generateAuthTokens(userId: string, role: string, status: string): AuthTokensDto
    hashToken(token: string): string;
    verifyRefreshToken(token: string): JwtPayload | string;
}