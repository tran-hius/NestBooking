import fetch from 'node-fetch';

async function testFlow() {
  console.log("Sending OTP...");
  const res1 = await fetch("http://localhost:5555/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test_auto_" + Date.now() + "@example.com" })
  });
  const data1 = await res1.json();
  console.log("Send OTP Response:", data1);

  if (!data1.data?.otpToken) {
    console.error("Failed to get OTP token");
    return;
  }

  // we can't easily get the OTP value without reading from Redis or DB
  // but wait! If we pass OTP '123456', it will say "Mã OTP không hợp lệ".
}
testFlow();
