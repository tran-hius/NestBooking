import { User, UserStatus } from "../../../../generated/prisma";
import {
  CreateUserDto,
  UpdateUserProfileDto,
  UserResponseDto,
  SubmitIdentityVerificationDto
} from "../dtos/UserDTO";



export interface IUserService {
  createUser(dto: CreateUserDto): Promise<UserResponseDto>;

  getUserById(id: string): Promise<UserResponseDto | null>;

  getUserByEmail(email: string): Promise<UserResponseDto | null>;

  getAllUsers(): Promise<UserResponseDto[]>;

  updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto>;

  changeUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<UserResponseDto>;

  /**
   * Xử lý khi người dùng đăng nhập sai mật khẩu
   * Tăng số lần thử (loginAttempts). Nếu vượt quá giới hạn, tự động khóa tài khoản tạm thời.
   */
  handleLoginFailure(userId: string): Promise<void>;

  /**
   * Xử lý khi người dùng đăng nhập thành công
   * Khôi phục số lần thử sai (loginAttempts) về 0 và xóa mốc thời gian khóa (lockUntil).
   */
  handleLoginSuccess(userId: string): Promise<void>;

  softDeleteUser(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  restoreUser(userId: string): Promise<UserResponseDto>;

  submitIdentityVerification(
    userId: string,
    dto: SubmitIdentityVerificationDto,
  ): Promise<UserResponseDto>;

  approveIdentityVerification(userId: string): Promise<UserResponseDto>;

  rejectIdentityVerification(
    userId: string,
    reason: string,
  ): Promise<UserResponseDto>;

  getUserWithPasswordByEmail(email: string): Promise<User | null>;
}
