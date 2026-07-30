export class StatisticsService {
    statsRepo;
    constructor(statsRepo) {
        this.statsRepo = statsRepo;
    }
    async getHotelRevenue(hotelId, startDate, endDate) {
        return this.statsRepo.revenue(hotelId, startDate, endDate);
    }
    async getHotelOccupancy(hotelId, startDate, endDate) {
        return this.statsRepo.occupancy(hotelId, startDate, endDate);
    }
}
