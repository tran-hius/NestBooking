import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";
import { Booking, BookingStatus } from "@/types";

export interface CreateBookingPayload {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  quantity: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  paymentMethod: "PAY_AT_HOTEL" | "VNPAY";
  specialRequests?: string;
}

class BookingService {
  async getAllBookings(): Promise<ApiResponse<Booking[]>> {
    return await axiosClient.get('/bookings/admin');
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

  async getHotelBookings(hotelId: string): Promise<ApiResponse<Booking[]>> {
    return await axiosClient.get(`/bookings/hotel/${hotelId}`);
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<ApiResponse<Booking>> {
    return await axiosClient.patch(`/bookings/${id}/status`, { status });
  }

  async getBookingDetails(id: string): Promise<ApiResponse> {
    return await axiosClient.get(`/bookings/${id}`);
  }
}

export const bookingService = new BookingService();
