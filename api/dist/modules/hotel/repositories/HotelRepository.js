import { HotelStatus, } from "../../../../generated/prisma";
export class HotelRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.hotel.create({
            data,
            // Lấy đầy đủ quan hệ ngay khi vừa tạo xong để trả về Client nếu cần
            include: {
                owner: true,
                images: true,
                roomTypes: true,
            },
        });
    }
    async findById(id, tx) {
        const client = tx || this.prisma;
        return client.hotel.findUnique({
            where: { id },
            include: {
                owner: true,
                images: true,
                roomTypes: true,
            },
        });
    }
    async findBySlug(slug, tx) {
        const client = tx || this.prisma;
        return client.hotel.findUnique({
            where: { slug },
            include: {
                owner: true,
                images: true,
                roomTypes: true,
            },
        });
    }
    async findByOwnerId(ownerId, tx) {
        const client = tx || this.prisma;
        return client.hotel.findMany({
            where: { ownerId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
                owner: true,
                images: true,
                roomTypes: true,
            },
        });
    }
    async update(id, data, tx) {
        const client = tx || this.prisma;
        return client.hotel.update({
            where: { id },
            data,
            include: {
                owner: true,
                images: true,
                roomTypes: true,
            },
        });
    }
    async delete(id, tx) {
        const client = tx || this.prisma;
        await client.hotel.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: HotelStatus.INACTIVE,
            },
        });
    }
    async restore(id, ownerId, tx) {
        const client = tx || this.prisma;
        await client.hotel.update({
            where: { id, ownerId },
            data: { deletedAt: null },
        });
    }
    async existsBySlug(slug, tx) {
        const client = tx || this.prisma;
        const count = await client.hotel.count({
            where: { slug },
        });
        return count > 0;
    }
    async findMany(options, tx) {
        const client = tx || this.prisma;
        return client.hotel.findMany(options);
    }
    async count(options, tx) {
        const client = tx || this.prisma;
        return client.hotel.count(options);
    }
    async addImages(images, tx) {
        const client = tx || this.prisma;
        await client.hotelImage.createMany({
            data: images,
        });
    }
    async findImageById(imageId, tx) {
        const client = tx || this.prisma;
        return client.hotelImage.findUnique({
            where: { id: imageId },
        });
    }
    async deleteImage(imageId, tx) {
        const client = tx || this.prisma;
        await client.hotelImage.delete({
            where: { id: imageId },
        });
    }
}
