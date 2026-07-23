import { BookingStatus } from "../../../../generated/prisma/index.js";
export class BookingStatisticsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async revenue(hotelId, startDate, endDate) {
        const result = await this.prisma.booking.aggregate({
            _sum: { totalAmount: true },
            where: {
                hotelId,
                status: BookingStatus.COMPLETED,
                checkInDate: { gte: startDate },
                checkOutDate: { lte: endDate },
            },
        });
        return Number(result._sum.totalAmount || 0);
    }
    async occupancy(hotelId, startDate, endDate) {
        const result = await this.prisma.booking.aggregate({
            _sum: { quantity: true },
            where: {
                hotelId,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
                checkInDate: { gte: startDate },
                checkOutDate: { lte: endDate },
            },
        });
        return result._sum.quantity || 0;
    }
}
