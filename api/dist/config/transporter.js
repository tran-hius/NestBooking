import nodemailer from "nodemailer";
import { emailConfig } from "@/config/email";
export class Transporter {
    static transporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: emailConfig.smtpPort === 465,
        auth: {
            user: emailConfig.smtpUser,
            pass: emailConfig.smtpPass,
        },
    });
}
