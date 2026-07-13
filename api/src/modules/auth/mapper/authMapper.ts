import { AuthResponseDto } from "@/modules/auth/dtos/authDto";
import { UserMapper } from "@/modules/user/mapper/UserMapper"; // 💡 Import UserMapper

export class AuthMapper {
  public static toAuthResponseDto(
    user: any,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
