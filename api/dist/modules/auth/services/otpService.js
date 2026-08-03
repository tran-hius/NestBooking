import logger from "@/config/logger";
import { env } from "@/config/env";
const OTP_TTL = Number(env.OTP_TTL);
import { REDIS_KEYS, redisClient } from "@/infrastructure/redis";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { EmailService } from "@/modules/email/services/emailService";
import { Transporter } from "@/config/transporter";
if (Number.isNaN(OTP_TTL)) {
    throw new Error("OTP_TTL không hợp lệ");
}
const emailService = new EmailService(Transporter.transporter);
export class OtpService {
    generateOtp() {
        return crypto.randomInt(100000, 1000000).toString();
    }
    async generateAndSendOtp(email) {
        const otp = this.generateOtp();
        const otpToken = randomUUID();
        await redisClient.setex(REDIS_KEYS.OTP(otpToken), OTP_TTL, JSON.stringify({ email, otp }));
        try {
            // Gửi email đồng bộ thay vì đẩy vào RabbitMQ
            await emailService.sendOtpEmail(email, otp);
        }
        catch (error) {
            await redisClient.del(REDIS_KEYS.OTP(otpToken));
            throw error;
        }
        return {
            otpToken,
        };
    }
    async verifyOtp(otp, otpToken) {
        const key = REDIS_KEYS.OTP(otpToken);
        const storedDataStr = await redisClient.get(key);
        if (!storedDataStr) {
            return null;
        }
        try {
            const storedData = JSON.parse(storedDataStr);
            if (storedData.otp !== otp) {
                logger.debug("[OTP Debug] Mismatch!");
                return null;
            }
            await redisClient.del(key);
            return storedData.email;
        }
        catch (e) {
            return null;
        }
    }
}
