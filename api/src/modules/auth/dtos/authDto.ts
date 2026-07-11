import { email } from "zod";
import z from "zod/v3";

export const SendOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email không đúng định dạng."),
  }),
});

export const VerifyOtpSchema = z.object({
    body: z.object({
        email: z.string().trim().email("Email không hợp lệ"),
        otp: z.string().length(6, "Mã otp phải có 6 chữ số"),
    })
})

export const LoginWithPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email không đúng định dạng."),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  }),
});


export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh Token không được để trống."),
  }),
});

export type SendOtpDto = z.infer<typeof SendOtpSchema>["body"];
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>["body"];
export type LoginWithPasswordDto = z.infer<
  typeof LoginWithPasswordSchema
>["body"];
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>["body"];

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface DeviceMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
}


export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  tokenHash: string;
}
