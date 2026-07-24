import { TxClient } from "@/config/prisma";
import { User, UserStatus } from "../../../../generated/prisma";
import {
  CreateUserDto,
  UpdateUserProfileDto,
  UserResponseDto,
  SubmitIdentityVerificationDto,
} from "../dtos/UserDTO";

export interface IUserService {
  createUser(dto: CreateUserDto, tx?: TxClient): Promise<UserResponseDto>;

  getUserById(id: string): Promise<UserResponseDto | null>;

  getUserByEmail(email: string): Promise<UserResponseDto | null>;

  getAllUsers(): Promise<UserResponseDto[]>;

  updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
    tx?: TxClient,
  ): Promise<UserResponseDto>;

  changeUserStatus(
    userId: string,
    status: UserStatus,
    tx?: TxClient,
  ): Promise<UserResponseDto>;
  handleLoginFailure(userId: string, tx?: TxClient): Promise<void>;

  handleLoginSuccess(userId: string, tx?: TxClient): Promise<void>;

  softDeleteUser(userId: string, tx?: TxClient): Promise<void>;

  updatePassword(
    userId: string,
    passwordHash: string,
    tx?: TxClient,
  ): Promise<void>;

  restoreUser(userId: string, tx?: TxClient): Promise<UserResponseDto>;

  submitIdentityVerification(
    userId: string,
    dto: SubmitIdentityVerificationDto,
    tx?: TxClient,
  ): Promise<UserResponseDto>;

  approveIdentityVerification(
    userId: string,
    tx?: TxClient,
  ): Promise<UserResponseDto>;

  rejectIdentityVerification(
    userId: string,
    reason: string,
    tx?: TxClient,
  ): Promise<UserResponseDto>;

  getUserWithPasswordByEmail(email: string): Promise<User | null>;
}
