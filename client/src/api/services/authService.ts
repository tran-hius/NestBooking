import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";
import { ApiResponse } from "@/api/types/apiResponse";

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  otpToken: string;
}

class AuthService {
  async sendOtp(payload: SendOtpPayload): Promise<ApiResponse> {
    return await axiosClient.post(API_ENDPOINTS.AUTH.SEND_OTP, payload);
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse> {
    return await axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
  }
  
  async checkEmail(email: string): Promise<ApiResponse> {
    return await axiosClient.post('/auth/check-email', { email });
  }

  async login(payload: any): Promise<ApiResponse> {
    return await axiosClient.post('/auth/login', payload);
  }

  async registerPartner(payload: any): Promise<ApiResponse> {
    return await axiosClient.post('/auth/register-partner', payload);
  }

  async register(payload: any): Promise<ApiResponse> {
    return await axiosClient.post('/auth/register', payload);
  }

  async resetPassword(payload: any): Promise<ApiResponse> {
    return await axiosClient.post('/auth/reset-password', payload);
  }

  async logout(): Promise<ApiResponse> {
    return await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getMe(): Promise<ApiResponse> {
    return await axiosClient.get(API_ENDPOINTS.AUTH.ME);
  }
}

export const authService = new AuthService();