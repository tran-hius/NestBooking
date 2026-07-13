import nodemailer from "nodemailer";
// 1. Import emailConfig từ file cấu hình email bạn vừa làm ở bước trước
import { emailConfig } from "@/modules/auth/config/emailConfig"; // Thay đổi đường dẫn cho đúng nhé

export class Transporter {
  static transporter = nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpPort === 465, // Tự động switch secure nếu dùng port 465
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });
}
