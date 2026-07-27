export class SearchRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findHotelsForSearch(hotelWhere, bookingOverlapCondition) {
        return this.prisma.hotel.findMany({
            where: hotelWhere,
            include: {
                images: { select: { imageUrl: true } },
                roomTypes: {
                    where: { isActive: true },
                    include: {
                        rooms: { where: { isActive: true, status: "AVAILABLE" } },
                        bookings: bookingOverlapCondition
                            ? { where: bookingOverlapCondition }
                            : false,
                    },
                },
            },
        });
    }
}
