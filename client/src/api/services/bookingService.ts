import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";

export interface CreateBookingPayload {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  quantity?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  paymentMethod?: string;
  specialRequests?: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequest?: string;
  };
}

class BookingService {
  async getAllBookings(): Promise<ApiResponse> {
    return await axiosClient.get('/bookings');
  }

  async getMyBookings(): Promise<ApiResponse> {
    return await axiosClient.get('/bookings/my-bookings');
  }

  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse> {
    return await axiosClient.post('/bookings', payload);
  }

  async cancelBooking(id: string): Promise<ApiResponse> {
    return await axiosClient.post(`/bookings/${id}/cancel`);
  }

  async getHotelBookings(hotelId: string): Promise<ApiResponse> {
    return await axiosClient.get(`/bookings/hotel/${hotelId}`);
  }

  async updateBookingStatus(id: string, status: string): Promise<ApiResponse> {
    return await axiosClient.patch(`/bookings/${id}`, { status });
  }

  async getBookingDetails(id: string): Promise<ApiResponse> {
    return await axiosClient.get(`/bookings/${id}`);
  }
}

export const bookingService = new BookingService();
