export class UserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getClient(tx) {
        return tx ?? this.prisma;
    }
    findAll(tx) {
        return this.getClient(tx).user.findMany({
            where: { deletedAt: null },
            include: { profile: true },
            orderBy: { createdAt: "desc" },
        });
    }
    findById(id, tx) {
        return this.getClient(tx).user.findFirst({
            where: { id, deletedAt: null },
            include: { profile: true, agentProfile: true },
        });
    }
    findByEmail(email, tx) {
        return this.getClient(tx).user.findFirst({
            where: { email, deletedAt: null },
        });
    }
    findByPhone(phone, tx) {
        return this.getClient(tx).user.findFirst({
            where: {
                deletedAt: null,
                profile: {
                    phoneNumber: phone,
                },
            },
            include: { profile: true },
        });
    }
    findByEmailOrPhone(email, phoneNumber, tx) {
        return this.getClient(tx).user.findFirst({
            where: {
                deletedAt: null,
                OR: [{ email }, ...(phoneNumber ? [{ profile: { phoneNumber } }] : [])],
            },
            include: { profile: true },
        });
    }
    create(data, tx) {
        return this.getClient(tx).user.create({
            data,
            include: { profile: true },
        });
    }
    update(id, data, tx) {
        return this.getClient(tx).user.update({
            where: { id },
            data,
            include: { profile: true, agentProfile: true },
        });
    }
    async incrementLoginAttempts(id, tx) {
        await this.getClient(tx).user.update({
            where: { id },
            data: {
                loginAttempts: {
                    increment: 1,
                },
            },
        });
    }
    async resetLoginAttempts(id, tx) {
        await this.getClient(tx).user.update({
            where: { id },
            data: {
                loginAttempts: 0,
                lockUntil: null,
            },
        });
    }
    updatePassword(id, passwordHash, tx) {
        return this.getClient(tx).user.update({
            where: { id },
            data: {
                passwordHash,
            },
            include: { profile: true },
        });
    }
    updateStatus(id, status, tx) {
        return this.getClient(tx).user.update({
            where: { id },
            data: {
                status,
            },
            include: { profile: true },
        });
    }
    async delete(id, tx) {
        await this.getClient(tx).user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async restore(id, tx) {
        await this.getClient(tx).user.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });
    }
    getUserWithPasswordByEmail(email, tx) {
        return this.getClient(tx).user.findFirst({
            where: {
                email,
                deletedAt: null,
            },
        });
    }
}
