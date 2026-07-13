import { AuthResponseDto, AuthTokensDto } from "@/modules/auth/dtos/authDto";

export interface ITokenService {
    hashPassword(password: string): Promise<string>
    comparePassword(password: string, hash: string): Promise<boolean>
    generateAuthTokens(userId: string, role: string, status: string): AuthTokensDto
    hashToken(token: string): string;
    verifyRefreshToken(token: string): any;
}