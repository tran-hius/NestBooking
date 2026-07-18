import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/api";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = location.state?.email;
  const initialOtpToken = searchParams.get("token") || location.state?.otpToken;

  const [otpToken, setOtpToken] = useState(initialOtpToken);

  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6 || !email || !initialOtpToken) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOtp({ email, otp, otpToken });

      useAppStore.getState().setToken(response.data.tokens.accessToken);

      if (response.data.user) {
        useAppStore.getState().setUser(response.data.user);
      }

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      toast.error("Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const result = await authService.sendOtp({ email });
      if (result.data?.otpToken) {
        setOtpToken(result.data.otpToken);
        // Cập nhật lại URL với token mới
        navigate(`/verify-otp?token=${result.data.otpToken}`, { state: { email }, replace: true });
      }
      toast.success("Đã gửi lại mã OTP vào email của bạn.");
    } catch (error) {
      toast.error("Lỗi khi gửi lại OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/90 transform -skew-y-6 origin-top-left -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-6 transition-transform hover:scale-105"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-xl">
            <MapPin className="h-7 w-7" />
          </div>
          <span className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
            NestBooking
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
              Xác thực tài khoản
            </h2>
            <p className="text-center text-slate-500 mt-2 text-sm max-w-[260px]">
              Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn. Vui
              lòng nhập mã để tiếp tục.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={3}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-14 text-xl font-bold bg-slate-50 border-slate-200"
                />
              </InputOTPGroup>
            </InputOTP>

            <Button
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/30"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Xác nhận
            </Button>

            <div className="text-sm text-center">
              <span className="text-slate-500">Chưa nhận được mã? </span>
              <button
                className="font-bold text-primary hover:text-blue-700 hover:underline transition-colors"
                onClick={handleResend}
              >
                Gửi lại mã
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
