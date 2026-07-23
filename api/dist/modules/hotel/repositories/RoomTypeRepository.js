export class RoomTypeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.roomType.create({
            data,
            include: { images: true },
        });
    }
    async update(id, data, tx) {
        const client = tx || this.prisma;
        return client.roomType.update({
            where: { id },
            data,
            include: { images: true },
        });
    }
    async delete(id, tx) {
        const client = tx || this.prisma;
        await client.roomType.delete({
            where: { id },
        });
    }
    async findById(id, tx) {
        const client = tx || this.prisma;
        return client.roomType.findUnique({
            where: { id },
            include: {
                images: true,
                _count: {
                    select: { rooms: true },
                },
            },
        });
    }
    async findByHotelId(hotelId, tx) {
        const client = tx || this.prisma;
        return client.roomType.findMany({
            where: { hotelId },
            orderBy: { createdAt: "desc" },
            include: {
                images: true,
                _count: {
                    select: { rooms: true },
                },
            },
        });
    }
    async findPublicByHotelId(hotelId, tx) {
        const client = tx || this.prisma;
        return client.roomType.findMany({
            where: {
                hotelId,
                isActive: true, // Chỉ lấy phòng đang mở bán
            },
            orderBy: { price: "asc" },
            include: {
                images: true,
                _count: {
                    select: { rooms: true },
                },
            },
        });
    }
    async existsByName(hotelId, name, tx) {
        const client = tx || this.prisma;
        const count = await client.roomType.count({
            where: { hotelId, name },
        });
        return count > 0;
    }
    async addImages(data, tx) {
        const client = tx || this.prisma;
        await client.roomTypeImage.createMany({
            data,
        });
    }
    async deleteImage(imageId, tx) {
        const client = tx || this.prisma;
        await client.roomTypeImage.delete({
            where: { id: imageId },
        });
    }
    async findImageById(imageId, tx) {
        const client = tx || this.prisma;
        return client.roomTypeImage.findUnique({
            where: { id: imageId },
        });
    }
}
