export class UserMapper {
    static toResponseDto(user) {
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
    static toResponseDtoList(users) {
        return users.map((user) => this.toResponseDto(user));
    }
}
