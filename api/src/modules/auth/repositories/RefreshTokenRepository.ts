import {
  Prisma,
  PrismaClient,
  RefreshToken,
} from "../../../../generated/prisma";
import { IRefreshTokenRepository } from "../interfaces/IRefreshTokenRepository";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
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

  revoke(id: string, reason: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async revokeAllForUser(userId: string, reason: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
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
