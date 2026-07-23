import { IOtpService } from "@/modules/auth/interfaces/IOtpService";
import logger from "@/config/logger";
import { env } from "@/config/env";
const OTP_TTL = Number(env.OTP_TTL);

import { REDIS_KEYS, redisClient } from "@/infrastructure/redis";
import { EXCHANGES, rabbitmq, ROUTING_KEYS } from "@/infrastructure/rabbitmq";
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

    try{
        await rabbitmq.publishToExchange(
          EXCHANGES.NOTIFICATION_DIRECT,
          ROUTING_KEYS.OTP_SEND,
          payload,
        );
    }catch(error){
      await redisClient.del(REDIS_KEYS.OTP(otpToken))
      throw error;

    }
    return {
      otpToken,
    };
  }

  async verifyOtp(otp: string, otpToken: string): Promise<string | null> {
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
    } catch (e) {
      return null;
    }
  }
}
