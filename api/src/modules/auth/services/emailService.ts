import { BadRequestError } from "@/utils/errors/errorCustomize";
import logger from "@/config/logger";
import { IEmailService } from "@/modules/auth/interfaces/IEmailService";
import nodemailer from "nodemailer";
import { getOtpEmailTemplate } from "@/modules/auth/templates/otpTemplate";
import { getBookingSuccessTemplate } from "@/modules/auth/templates/bookingSuccessTemplate";
import { getBookingFailTemplate } from "@/modules/auth/templates/bookingFailTemplate";
import { emailConfig } from "@/config/email";

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(transporter: nodemailer.Transporter) {
    this.transporter = transporter;
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: emailConfig.defaultSender, 
        to,
        subject,
        html: htmlContent,
      });
      logger.info(`Đã gửi email tới ${to}`);
    } catch (error) {
      logger.error(`Lỗi khi gửi email tới ${to}:`, error);
      throw new BadRequestError(
        "Không thể gửi email lúc này vui lòng kiểm tra lại cấu hình SMTP",
      );
    }
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const subject = "Mã xác thực OTP - NestBooking";
    const htmlContent = getOtpEmailTemplate(otpCode);
    await this.sendEmail(to, subject, htmlContent);
  }

  async sendBookingSuccessEmail(to: string, bookingCode: string, checkInDate: string, checkOutDate: string): Promise<void> {
    const subject = `Xác nhận đặt phòng thành công - Mã đơn: ${bookingCode}`;
    const htmlContent = getBookingSuccessTemplate(bookingCode, checkInDate, checkOutDate);
    await this.sendEmail(to, subject, htmlContent);
  }

  async sendBookingFailEmail(to: string, bookingCode: string, reason: string): Promise<void> {
    const subject = `Hủy đặt phòng - Mã đơn: ${bookingCode}`;
    const htmlContent = getBookingFailTemplate(bookingCode, reason);
    await this.sendEmail(to, subject, htmlContent);
  }
}
