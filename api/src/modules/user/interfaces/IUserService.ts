import { UserStatus } from "../../../../generated/prisma";
import {
  CreateUserDto,
  UpdateUserProfileDto,
  UserResponseDto,
} from "../UserDTO";



export interface IUserService {
  getAllUsers(): Promise<UserResponseDto[]>;

  getUserById(id: string): Promise<UserResponseDto | null>;

  getUserByEmail(email: string): Promise<UserResponseDto | null>;

  createUser(dto: CreateUserDto): Promise<UserResponseDto>;

  updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto>;

  changeUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<UserResponseDto>;

  handleLoginFailure(userId: string): Promise<void>;

  handleLoginSuccess(userId: string): Promise<void>;
}
