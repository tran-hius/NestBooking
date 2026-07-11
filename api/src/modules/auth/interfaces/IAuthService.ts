import { AuthResponseDto, SendOtpDto, VerifyOtpDto, LoginWithPasswordDto, DeviceMetadata, RefreshTokenDto } from "../dtos/authDto";

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
  
}