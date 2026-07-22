export interface IBookingStatisticsRepository {
  revenue(hotelId: string, startDate: Date, endDate: Date): Promise<number>;

  occupancy(hotelId: string, startDate: Date, endDate: Date): Promise<number>;
}
