import { authService } from "./src/modules/auth/index.js";
import { prisma } from "./src/config/prisma.js";

async function run() {
  try {
    // Mock otpService temporarily
    authService.otpService.verifyOtp = async () => "test_mock_" + Date.now() + "@example.com";
    
    await authService.verifyOtpAndLogin({ otp: "123456", email: "ignored", otpToken: "ignored" }, { ipAddress: "127.0.0.1", userAgent: "mock", deviceName: "mock" });
    console.log("SUCCESS!");
  } catch(e) {
    console.error("FAILED:", e);
  } finally {
    prisma.$disconnect();
  }
}
run();
