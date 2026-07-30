import z from "zod/v3";
export const SendOtpSchema = z.object({
    body: z.object({
        email: z.string().trim().email("Email không đúng định dạng."),
    }),
});
export const VerifyOtpSchema = z.object({
    body: z.object({
        otp: z.string().length(6, "Mã otp phải có 6 chữ số"),
        otpToken: z.string().min(1, "OTP Token không được để trống"),
    })
});
export const LoginWithPasswordSchema = z.object({
    body: z.object({
        email: z.string().trim().email("Email không đúng định dạng."),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    }),
});
export const ResetPasswordSchema = z.object({
    body: z.object({
        otp: z.string().length(6, "Mã OTP phải có 6 chữ số"),
        otpToken: z.string().min(1, "OTP Token không được để trống"),
        newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    }),
});
export const ChangePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().optional(),
        newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    }),
});
export const RefreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "Refresh Token không được để trống."),
    }),
});
export const RegisterPartnerSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, "Họ và tên không được để trống."),
        phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ."),
        address: z.string().min(1, "Địa chỉ không được để trống."),
    }),
});
export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().trim().email("Email kh�ng d�ng d?nh d?ng."),
        password: z.string().min(6, "M?t kh?u ph?i c� �t nh?t 6 k� t?."),
        confirmPassword: z.string().min(6, "M?t kh?u nh?p l?i ph?i c� �t nh?t 6 k� t?."),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "M?t kh?u kh�ng kh?p.",
        path: ["confirmPassword"],
    }),
});
