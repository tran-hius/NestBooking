import { TxClient } from "@/config/prisma";
import { AuthResponseDto, SendOtpDto, VerifyOtpDto, LoginWithPasswordDto, DeviceMetadata, RefreshTokenDto, ResetPasswordDto, ChangePasswordDto, OtpTokenResponse } from "@/modules/auth/dtos/authDto";
import { UserResponseDto } from "@/modules/user/dtos/UserDTO";

export interface IAuthService {
  getMe(userId: string): Promise<UserResponseDto>;
  sendOtp(dto: SendOtpDto): Promise<OtpTokenResponse>;
  verifyOtpAndLogin(dto: VerifyOtpDto, device: DeviceMetadata, tx?: TxClient): Promise<AuthResponseDto>;
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