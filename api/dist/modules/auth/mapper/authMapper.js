export class AuthMapper {
    static toAuthResponseDto(user, accessToken, refreshToken) {
        return {
            user: user,
            tokens: {
                accessToken,
                refreshToken,
            },
        };
    }
}
