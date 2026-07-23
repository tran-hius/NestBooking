export class RefreshTokenRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data, tx) {
        const client = tx || this.prisma;
        return client.refreshToken.create({
            data,
        });
    }
    findById(id) {
        return this.prisma.refreshToken.findUnique({
            where: { id },
        });
    }
    findByTokenHash(tokenHash) {
        return this.prisma.refreshToken.findFirst({
            where: { tokenHash },
        });
    }
    update(id, data) {
        return this.prisma.refreshToken.update({
            where: { id },
            data,
        });
    }
    revoke(id, reason, tx) {
        const client = tx || this.prisma;
        return client.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                revokeReason: reason,
            },
        });
    }
    async revokeAllForUser(userId, reason) {
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
    async findActiveTokensByUser(userId) {
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
