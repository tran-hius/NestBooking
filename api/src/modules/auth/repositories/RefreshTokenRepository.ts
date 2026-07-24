import { TxClient } from "@/config/prisma";
import {
  Prisma,
  PrismaClient,
  RefreshToken,
} from "../../../../generated/prisma";
import { IRefreshTokenRepository } from "@/modules/auth/interfaces/IRefreshTokenRepository";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  create(data: Prisma.RefreshTokenUncheckedCreateInput, tx?: TxClient): Promise<RefreshToken> {
    const client  = tx || this.prisma;
    return client.refreshToken.create({
      data,
    })
  }

  findById(id: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { id },
    });
  }

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash },
    });
  }

  update(
    id: string,
    data: Prisma.RefreshTokenUpdateInput,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data,
    });
  }

  revoke(id: string, reason: string, tx?: TxClient): Promise<RefreshToken> {
    const client = tx || this.prisma;
    return client.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async revokeAllForUser(userId: string, reason: string, tx?: TxClient): Promise<void> {
    const client = tx || this.prisma;
    await client.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async findActiveTokensByUser(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
