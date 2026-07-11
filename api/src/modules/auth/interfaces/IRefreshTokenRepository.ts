import { Prisma, RefreshToken } from "../../../../generated/prisma";

export interface IRefreshTokenRepository {
  create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  update(id: string, data: Prisma.RefreshTokenUpdateInput): Promise<RefreshToken>;
  revoke(id: string, reason: string): Promise<RefreshToken>;
  revokeAllForUser(userId: string, reason: string): Promise<void>;
  findActiveTokensByUser(userId: string): Promise<RefreshToken[]>;
}