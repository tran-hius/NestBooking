import { IOtpService } from "@/modules/auth/interfaces/IOtpService";
import { env } from "@/config/env";
const OTP_TTL = Number(env.OTP_TTL);

import { REDIS_KEYS, redisClient } from "@/infrastructure/redis";
import { rabbitMQ } from "@/infrastructure/rabbitmq";
import { QUEUES } from "@/infrastructure/rabbitmq/queues";
import { EmailOtpPayload } from "@/modules/auth/queue/EmailOtpPayload";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { OtpTokenResponse } from "../dtos/authDto";

if (Number.isNaN(OTP_TTL)) {
  throw new Error("OTP_TTL không hợp lệ");
}

export class OtpService implements IOtpService {
  private generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async generateAndSendOtp(email: string): Promise<OtpTokenResponse> {
    const otp = this.generateOtp();
    const otpToken = randomUUID();

    await redisClient.setex(
      REDIS_KEYS.OTP(otpToken),
      OTP_TTL,
      JSON.stringify({ email, otp }),
    );

    const payload: EmailOtpPayload = {
      to: email,
      otpCode: otp,
    };

    await rabbitMQ.sendToQueue(QUEUES.EMAIL_OTP, payload);

    return {
      otpToken,
    };
  }

  async verifyOtp(email: string, otp: string, otpToken: string): Promise<boolean> {
    const key = REDIS_KEYS.OTP(otpToken); // Lookup by otpToken

    const storedDataStr = await redisClient.get(key);

    if (!storedDataStr) {
      return false;
    }

    try {
      const storedData = JSON.parse(storedDataStr);
      if (storedData.email !== email || storedData.otp !== otp) {
        return false;
      }
    } catch (e) {
      return false;
    }

    await redisClient.del(key);

    return true;
  }
}
