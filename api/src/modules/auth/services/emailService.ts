import { BadRequestError } from "../../../utils/errors/errorCustomize";
import logger from "../../../utils/logger";
import { IEmailService } from "../interfaces/IEmailService";
import nodemailer from "nodemailer";

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
        from: `NestBooking Support <${process.env.SMTP_USER}>`,
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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">NestBooking</h2>
        <p>Chào bạn,</p>
        <p>Bạn vừa yêu cầu mã xác thực OTP để đăng nhập hệ thống. Đây là mã của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 28px; font-weight: bold; background: #f4f4f4; padding: 15px 30px; letter-spacing: 5px; border-radius: 8px; border: 1px dashed #ccc;">
            ${otpCode}
          </span>
        </div>
        <p style="color: red; font-size: 14px;">Lưu ý: Mã này chỉ có hiệu lực trong 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Trân trọng, <br> Đội ngũ hỗ trợ NestBooking</p>
      </div>
    `;
    await this.sendEmail(to, subject, htmlContent);
  }
}