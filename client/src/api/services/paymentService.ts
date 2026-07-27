import { axiosClient } from "@/api/config/axiosClient";
import { ApiResponse } from "@/api/types/apiResponse";

export interface CreatePaymentPayload {
  bookingId: string;
  paymentMethod: string;
  amount?: number;
}

export const paymentService = {
  createPayment: async (payload: CreatePaymentPayload): Promise<ApiResponse> => {
    return await axiosClient.post('/payments/create', payload);
  },

  getAllPayments: async (): Promise<ApiResponse> => {
    return await axiosClient.get('/payments');
  },

  getPaymentDetails: async (id: string): Promise<ApiResponse> => {
    return await axiosClient.get(`/payments/${id}`);
  },

  verifyPaymentStatus: async (id: string): Promise<ApiResponse> => {
    return await axiosClient.post(`/payments/${id}/verify`);
  }
};
