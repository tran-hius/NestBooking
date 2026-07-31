export class ReviewRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.review.create({ data });
    }
    async findById(id) {
        return this.prisma.review.findUnique({ where: { id } });
    }
    async findByHotel(hotelId) {
        return this.prisma.review.findMany({
            where: { hotelId },
            orderBy: { createdAt: "desc" },
        });
    }
    async update(id, data) {
        return this.prisma.review.update({ where: { id }, data });
    }
    async delete(id) {
        await this.prisma.review.delete({ where: { id } });
    }
}
