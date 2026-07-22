import { OtpTokenResponse } from "../dtos/authDto";


export interface IOtpService {
  generateAndSendOtp(email: string): Promise<OtpTokenResponse>;
  verifyOtp(otp: string, otpToken: string): Promise<string | null>;
}