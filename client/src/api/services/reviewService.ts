import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";

export interface CreateReviewPayload {
  hotelId: string;
  bookingId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  createReview: async (payload: CreateReviewPayload): Promise<ApiResponse> => {
    return await axiosClient.post('/reviews', payload);
  },

  getAllReviews: async (): Promise<ApiResponse> => {
    return await axiosClient.get('/reviews');
  },

  getHotelReviews: async (hotelId: string): Promise<ApiResponse> => {
    return await axiosClient.get(`/reviews/hotel/${hotelId}`);
  },

  deleteReview: async (id: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/reviews/${id}`);
  }
};
