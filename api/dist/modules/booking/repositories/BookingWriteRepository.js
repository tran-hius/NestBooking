import { BookingStatus } from "../../../../generated/prisma";
export class BookingWriteRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.booking.create({ data });
    }
    async createMany(data) {
        return this.prisma.booking.createMany({ data });
    }
    async update(id, data) {
        return this.prisma.booking.update({
            where: { id },
            data,
        });
    }
    async updateMany(where, data) {
        return this.prisma.booking.updateMany({
            where,
            data,
        });
    }
    async softDelete(id) {
        return this.prisma.booking.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async restore(id) {
        return this.prisma.booking.update({
            where: { id },
            data: { status: BookingStatus.PENDING },
        });
    }
    async deleteMany(where) {
        return this.prisma.booking.deleteMany({ where });
    }
}
