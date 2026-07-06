import { Role, UserStatus } from "../../../generated/prisma";

export interface CreateUserDto {
  email: string;
  fullName: string;
  role: Role;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  address?: string;
  defaultPaymentMethod?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    address: string | null;
  } | null;
}