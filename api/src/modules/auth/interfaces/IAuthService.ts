import { AuthResponseDto, SendOtpDto, VerifyOtpDto, LoginWithPasswordDto, DeviceMetadata, RefreshTokenDto, ResetPasswordDto, ChangePasswordDto } from "@/modules/auth/dtos/authDto";

export interface IAuthService {
  sendOtp(dto: SendOtpDto): Promise<void>;
  verifyOtpAndLogin(dto: VerifyOtpDto, device: DeviceMetadata): Promise<AuthResponseDto>;
  loginWithPassword(
    dto: LoginWithPasswordDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto>;
  refreshTokens(
    dto: RefreshTokenDto,
    device: DeviceMetadata,
  ): Promise<AuthResponseDto>;
  logout(refreshTokenStr: string): Promise<void>;
  resetPassword(dto: ResetPasswordDto): Promise<void>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
}