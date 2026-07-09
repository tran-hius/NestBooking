import { Role, UserStatus } from "../../../../generated/prisma";

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
  passwordHash?: string;
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
  agentProfile?: {
    businessName: string;
    idNumber: string | null;
    idCardImageUrl: string | null;
    approvalStatus: string;
    rejectedReason: string | null;
    approvedAt: Date | null;
  } | null; // Có thể null nếu tài khoản này là USER thuần túy chưa từng KYC
}

export interface SubmitIdentityVerificationDto {
  documentType: "CCCD" | "PASSPORT" | "DRIVING_LICENSE";
  idNumber: string;
  idCardImageUrl: string; 
}