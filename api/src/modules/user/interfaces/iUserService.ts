import { TxClient } from "@/config/prisma";
import { User, UserStatus } from "../../../../generated/prisma";
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserAdminDto,
} from "../dtos/userDTO";

export interface IUserService {
  updateUserAdmin(userId: string, dto: UpdateUserAdminDto, tx?: TxClient): Promise<UserResponseDto>;
  createUser(dto: CreateUserDto & { passwordHash?: string; phoneNumber?: string }, tx?: TxClient): Promise<UserResponseDto>;

  getUserById(id: string): Promise<UserResponseDto | null>;

  getUserByEmail(email: string): Promise<UserResponseDto | null>;

  getAllUsers(): Promise<UserResponseDto[]>;

  changeUserStatus(
    userId: string,
    status: UserStatus,
    tx?: TxClient,
  ): Promise<UserResponseDto>;
  
  handleLoginFailure(userId: string, tx?: TxClient): Promise<void>;

  handleLoginSuccess(userId: string, tx?: TxClient): Promise<void>;

  softDeleteUser(userId: string, tx?: TxClient): Promise<void>;

  restoreUser(userId: string, tx?: TxClient): Promise<UserResponseDto>;

  getUserWithPasswordByEmail(email: string): Promise<User | null>;
}
