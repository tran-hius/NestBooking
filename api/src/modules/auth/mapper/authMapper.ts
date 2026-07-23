import { AuthResponseDto, AuthTokensDto } from "../dtos/authDto";
import { UserResponseDto } from "@/modules/user/dtos/UserDTO";

export class AuthMapper {
  public static toAuthResponseDto(
    user: UserResponseDto,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      user: user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
