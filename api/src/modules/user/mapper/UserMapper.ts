import { UserResponseDto } from "@/modules/user/dtos/UserDTO";

export class UserMapper {
  public static toResponseDto(user: any): UserResponseDto {
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
      agentProfile: user.agentProfile
        ? {
            businessName: user.agentProfile.businessName,
            idNumber: user.agentProfile.idNumber,
            idCardImageUrl: user.agentProfile.idCardImageUrl,
            approvalStatus: user.agentProfile.approvalStatus,
            rejectedReason: user.agentProfile.rejectedReason,
            approvedAt: user.agentProfile.approvedAt,
          }
        : null,
    };
    
  }

  public static toResponseDtoList(users: any[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
