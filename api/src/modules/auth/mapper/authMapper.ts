import { AuthResponseDto } from "../dtos/authDto";
import { UserMapper } from "../../user/mapper/UserMapper"; // 💡 Import UserMapper

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
