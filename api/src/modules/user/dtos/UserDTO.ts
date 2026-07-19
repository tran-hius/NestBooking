import { z } from "zod/v3";
import { Role, UserStatus } from "../../../../generated/prisma";

export const UserIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID người dùng không đúng định dạng UUID."),
  }),
});

export const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Email không đúng định dạng."),
    fullName: z.string().trim().min(1, "Họ tên không được để trống.").max(100).optional(),
    role: z.nativeEnum(Role, { message: "Vai trò không hợp lệ." }),
  }),
});

export const UpdateUserProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Họ tên không để trống.").max(100).optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{9,15}$/, "Số điện thoại từ 9-15 số.")
      .optional(),
    avatarUrl: z
      .string()
      .url("Ảnh đại diện phải là url hợp lệ.")
      .optional()
      .or(z.literal("")),
    address: z.string().max(255).optional(),
    passwordHash: z.string().optional(),
  }),
});

export const SubmitIdentityVerificationSchema = z.object({
  body: z.object({
    documentType: z.enum(["CCCD", "PASSPORT", "DRIVING_LICENSE"], {
      message: "Loại giấy tờ xác minh không hợp lệ.",
    }),
    idNumber: z.string().min(5, "Số giấy tờ tối thiểu 5 ký tự."),
    idCardImageUrl: z.string().url("Ảnh giấy tờ phải là url hợp lệ."),
  }),
});

export const ChangeUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus, {
      message: "Trạng thái người dùng không hợp lệ.",
    }),
  }),
});

export const RejectIdentityVerificationSchema = z.object({
  body: z.object({
    reason: z.string().min(1, "Lý do từ chối không được để trống."),
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>["body"];
export type UpdateUserProfileDto = z.infer<
  typeof UpdateUserProfileSchema
>["body"];
export type SubmitIdentityVerificationDto = z.infer<
  typeof SubmitIdentityVerificationSchema
>["body"];
export type ChangeUserStatusDto = z.infer<
  typeof ChangeUserStatusSchema
>["body"];
export type RejectIdentityVerificationDto = z.infer<
  typeof RejectIdentityVerificationSchema
>["body"];

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
  } | null;
}
