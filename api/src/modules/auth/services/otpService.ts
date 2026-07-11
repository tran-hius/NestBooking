
import { IEmailService } from "../interfaces/IEmailService";
import { IOtpService } from "../interfaces/IOtpService";
const OTP_TTL = process.env.OTP_TTL;



import { redisClient } from "../../../lib/redis";


export class OtpService implements IOtpService {
   private readonly mailService: IEmailService;

   constructor(mailService: IEmailService){
    this.mailService = mailService
   }

   async generateAndSendOtp(email: string): Promise<void> {
       const otp = Math.floor(100000 + Math.random() * 900000).toString()
       await redisClient.setex(`otp:${email}`, OTP_TTL!, otp)

       await this.mailService.sendOtpEmail(email, otp);
   }

   async verifyOtp(email: string, otp: string): Promise<boolean> {
       const key = `otp:${email}`;

       const storedOtp = await redisClient.get(key);

       if(!storedOtp){
        return false;
       }

       if(storedOtp === otp){
        await redisClient.del(key);
        return true;
       }

       return false;
   }

}
