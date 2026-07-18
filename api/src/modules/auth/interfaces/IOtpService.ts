import { OtpTokenResponse } from "../dtos/authDto";


export interface IOtpService {
  generateAndSendOtp(email: string): Promise<OtpTokenResponse>;
  verifyOtp(email: string, otp: string, otpToken: string): Promise<boolean>;
}