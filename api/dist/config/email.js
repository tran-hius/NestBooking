import { env as appEnv } from "@/config/env";
const SMTP_HOST = appEnv.SMTP_HOST;
const SMTP_PASS = appEnv.SMTP_PASSWORD;
const SMTP_PORT = appEnv.SMTP_PORT;
const SMTP_USER = appEnv.SMTP_USER;
export const emailConfig = {
    smtpHost: SMTP_HOST || "smtp.gmail.com",
    smtpPort: SMTP_PORT || 587,
    smtpUser: SMTP_USER || "",
    smtpPass: SMTP_PASS || "",
    defaultSender: `NestBooking Support <${SMTP_USER}>`,
};
