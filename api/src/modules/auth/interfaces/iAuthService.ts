import { TxClient } from "@/config/prisma";
import { AuthResponseDto, SendOtpDto, VerifyOtpDto, LoginWithPasswordDto, RegisterPartnerDto, RegisterDto, DeviceMetadata, RefreshTokenDto, ResetPasswordDto, ChangePasswordDto, OtpTokenResponse } from "@/modules/auth/dtos/authDto";
import { UserResponseDto } from "@/modules/user/dtos/userDTO";

export interface IAuthService {
  checkEmailExists(email: string): Promise<{ exists: boolean }>;
  getMe(userId: string): Promise<UserResponseDto>;
  sendOtp(dto: SendOtpDto): Promise<OtpTokenResponse>;
  verifyOtpAndLogin(dto: VerifyOtpDto, device: DeviceMetadata, tx?: TxClient): Promise<AuthResponseDto>;
  loginWithPassword(
    dto: LoginWithPasswordDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto>;
  register(
    dto: RegisterDto,
    device: DeviceMetadata,
    tx?: TxClient
  ): Promise<OtpTokenResponse>;
  verifyRegistrationOtp(
    otp: string,
    otpToken: string,
    tx?: TxClient,
  ): Promise<void>;
  registerPartner(
    userId: string,
    dto: RegisterPartnerDto,
    device: DeviceMetadata,
    tx?: TxClient
  ): Promise<AuthResponseDto>;
  refreshTokens(
    dto: RefreshTokenDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto>;
  logout(refreshTokenStr: string): Promise<void>;
  resetPassword(dto: ResetPasswordDto): Promise<void>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
}