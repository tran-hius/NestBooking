import { TxClient } from "@/config/prisma";
import { Prisma, RefreshToken } from "../../../../generated/prisma";

export interface IRefreshTokenRepository {
  create(data: Prisma.RefreshTokenUncheckedCreateInput, tx?: TxClient): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  update(id: string, data: Prisma.RefreshTokenUpdateInput): Promise<RefreshToken>;
  revoke(id: string, reason: string, tx?: TxClient): Promise<RefreshToken>;
  revokeAllForUser(userId: string, reason: string): Promise<void>;
  findActiveTokensByUser(userId: string): Promise<RefreshToken[]>;
}