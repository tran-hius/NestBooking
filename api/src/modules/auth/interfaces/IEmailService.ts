export interface IEmailService {
    sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
    sendOtpEmail(to: string, otpCode: string): Promise<void>;
}