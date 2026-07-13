import { IOtpService } from "../interfaces/IOtpService";
import { env } from "../../../config/env";
const OTP_TTL = Number(env.OTP_TTL);

import { REDIS_KEYS, redisClient } from "../../../infrastructure/redis";
import { rabbitMQ } from "../../../infrastructure/rabbitmq";
import { QUEUES } from "../../../infrastructure/rabbitmq/queues";
import { EmailOtpPayload } from "../queue/EmailOtpPayload";
import crypto from "crypto";

if (Number.isNaN(OTP_TTL)) {
  throw new Error("OTP_TTL không hợp lệ");
}

export class OtpService implements IOtpService {
  private generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async generateAndSendOtp(email: string): Promise<void> {
    const otp = this.generateOtp();

    await redisClient.setex(REDIS_KEYS.OTP(email), OTP_TTL, otp);

    const payload: EmailOtpPayload = {
      to: email,
      otpCode: otp,
    };

    await rabbitMQ.sendToQueue(QUEUES.EMAIL_OTP, payload);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = REDIS_KEYS.OTP(email);

    const storedOtp = await redisClient.get(key);

    if (!storedOtp) {
      return false;
    }

    if (storedOtp !== otp) {
      return false;
    }
    await redisClient.del(key);

    return true;
  }
}
