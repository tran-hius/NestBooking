import { axiosClient } from "@/api/config/axiosClient";
import { API_ENDPOINTS } from "@/api/constants/endpoints";

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  otpToken: string;
}

export interface SendOtpResponse {
  message: string;
  otpToken: string;
}

export interface VerifyOtpResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    email: string;
  };
}
class AuthService {
  async sendOtp(payload: SendOtpPayload): Promise<{ data: SendOtpResponse }> {
    return await axiosClient.post(API_ENDPOINTS.AUTH.SEND_OTP, payload);
  }

  async verifyOtp(
    payload: VerifyOtpPayload,
  ): Promise<{ data: VerifyOtpResponse }> {
    return await axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
  }

  async logout() {
    return await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getMe() {
    return await axiosClient.get(API_ENDPOINTS.AUTH.ME);
  }
}

export const authService = new AuthService();