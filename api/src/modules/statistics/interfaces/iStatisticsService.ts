export interface IStatisticsService {
  getHotelRevenue(hotelId: string, startDate: Date, endDate: Date): Promise<number>;
  getHotelOccupancy(hotelId: string, startDate: Date, endDate: Date): Promise<number>;
}