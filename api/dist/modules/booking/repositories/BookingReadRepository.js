import { BookingStatus } from "../../../../generated/prisma";
export class BookingReadRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.booking.findUnique({
            where: { id },
            include: {
                hotel: { select: { id: true, name: true, ownerId: true } },
                roomType: { select: { id: true, name: true } },
                user: { select: { id: true, email: true } },
            },
        });
    }
    async findByBookingCode(code) {
        return this.prisma.booking.findUnique({
            where: { bookingCode: code },
            include: {
                hotel: true,
                roomType: true,
            },
        });
    }
    async findMany(where, skip, take) {
        return this.prisma.booking.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });
    }
    async search(keyword) {
        return this.prisma.booking.findMany({
            where: {
                OR: [
                    { guestName: { contains: keyword, mode: "insensitive" } },
                    { guestPhone: { contains: keyword } },
                    { bookingCode: { contains: keyword } },
                ],
            },
        });
    }
    async pagination(where, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return { data, total };
    }
    async exists(where) {
        const count = await this.prisma.booking.count({ where });
        return count > 0;
    }
    async count(where) {
        return this.prisma.booking.count({ where });
    }
    async getOverlappingBookingsCount(roomTypeId, checkIn, checkOut) {
        const overlappingBookings = await this.prisma.booking.aggregate({
            _sum: { quantity: true },
            where: {
                roomTypeId,
                status: { in: [BookingStatus.CONFIRMED] },
                NOT: {
                    OR: [
                        { checkOutDate: { lte: checkIn } },
                        { checkInDate: { gte: checkOut } },
                    ],
                },
            },
        });
        return overlappingBookings._sum.quantity || 0;
    }
}
