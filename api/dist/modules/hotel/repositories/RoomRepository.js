export class RoomRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.room.create({
            data,
        });
    }
    async update(id, data, tx) {
        const client = tx || this.prisma;
        return client.room.update({
            where: { id },
            data,
        });
    }
    async delete(id, tx) {
        const client = tx || this.prisma;
        await client.room.delete({
            where: { id },
        });
    }
    async findById(id, tx) {
        const client = tx || this.prisma;
        return client.room.findUnique({
            where: { id },
        });
    }
    async findByHotelId(hotelId, tx) {
        const client = tx || this.prisma;
        return client.room.findMany({
            where: { hotelId },
            orderBy: { roomNumber: "asc" },
        });
    }
    async findByRoomTypeId(roomTypeId, tx) {
        const client = tx || this.prisma;
        return client.room.findMany({
            where: { roomTypeId },
            orderBy: { roomNumber: "asc" },
        });
    }
    async existsByNumber(hotelId, roomNumber, tx) {
        const client = tx || this.prisma;
        const count = await client.room.count({
            where: { hotelId, roomNumber },
        });
        return count > 0;
    }
    async count(where, tx) {
        const client = tx || this.prisma;
        return client.room.count({ where });
    }
}
