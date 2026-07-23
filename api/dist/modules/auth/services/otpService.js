import logger from "../../../config/logger.js";
import { env } from "../../../config/env.js";
const OTP_TTL = Number(env.OTP_TTL);
import { REDIS_KEYS, redisClient } from "../../../infrastructure/redis/index.js";
import { EXCHANGES, rabbitmq, ROUTING_KEYS } from "../../../infrastructure/rabbitmq/index.js";
import crypto from "crypto";
import { randomUUID } from "crypto";
if (Number.isNaN(OTP_TTL)) {
    throw new Error("OTP_TTL không hợp lệ");
}
export class OtpService {
    generateOtp() {
        return crypto.randomInt(100000, 1000000).toString();
    }
    async generateAndSendOtp(email) {
        const otp = this.generateOtp();
        const otpToken = randomUUID();
        await redisClient.setex(REDIS_KEYS.OTP(otpToken), OTP_TTL, JSON.stringify({ email, otp }));
        const payload = {
            to: email,
            otpCode: otp,
        };
        try {
            await rabbitmq.publishToExchange(EXCHANGES.NOTIFICATION_DIRECT, ROUTING_KEYS.OTP_SEND, payload);
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
