import { UserResponseDto } from "@/modules/user/dtos/userDTO";

import { Prisma, User, UserProfile } from "#generated/prisma";

type UserWithRelations = User & {
  profile?: UserProfile | null;
};

export class UserMapper {
  public static toResponseDto(user: UserWithRelations): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            fullName: user.profile.fullName,
            phoneNumber: user.profile.phoneNumber,
            avatarUrl: user.profile.avatarUrl,
            address: user.profile.address,
          }
        : null,
    };
    
  }

  public static toResponseDtoList(users: UserWithRelations[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
