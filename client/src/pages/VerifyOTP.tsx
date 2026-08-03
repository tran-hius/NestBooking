import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { authService } from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import HeaderBanner from "@/assets/HeaderBanner.jpg";

export default function VerifyOTP() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get("email") || "";
  const otpToken = searchParams.get("otpToken") || "";
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // If missing token or email, go back to register
  if (!email || !otpToken) {
    navigate("/register", { replace: true });
    return null;
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) return toast.error("Vui lòng nhập mã OTP 6 số");
    setLoading(true);
    try {
      await authService.verifyRegistrationOtp({ email, otp, otpToken });
      toast.success("Tài khoản đã được xác thực thành công. Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setIsResending(true);
    try {
      const response = await authService.sendOtp({ email });
      const newOtpToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (newOtpToken) {
        setSearchParams({ email, otpToken: newOtpToken });
        setTimeLeft(60);
        toast.success("Mã OTP mới đã được gửi");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi lại OTP thất bại");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-slate-50">
      <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
        
        {/* Left Side (Banner) */}
        <section className="relative hidden min-h-64 overflow-hidden bg-[#05285d] lg:block lg:w-full">
          <img src={HeaderBanner} alt="Điểm đến du lịch Việt Nam" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#031b3d]/95 via-[#064c87]/75 to-[#05285d]/35" />
          <div className="relative flex h-full flex-col justify-center p-6 text-white sm:p-10 lg:p-14 xl:p-16">
            <div className="max-w-lg">
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Gần xong rồi!</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-blue-100/80 sm:text-base">Vui lòng kiểm tra email của bạn để lấy mã số xác thực gồm 6 chữ số.</p>
            </div>
          </div>
        </section>

        {/* Right Side (Form) */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  <ShieldCheck className="h-4 w-4" /> Xác thực tài khoản
                </div>
                <button type="button" onClick={() => navigate("/login")} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary">
                  <ArrowLeft className="h-3.5 w-3.5" /> Đăng nhập
                </button>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Xác minh Email</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Mã OTP xác thực tài khoản đã được gửi đến <span className="font-semibold text-slate-700">{email}</span>.</p>
            </div>

            <form className="space-y-6" onSubmit={handleVerify}>
              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Mã xác thực 6 số</label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="w-full">
                  <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} className="h-12 w-full rounded-xl border border-input bg-background text-lg font-bold text-foreground" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button disabled={loading} className="h-12 w-full rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/15">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Xác thực tài khoản
              </Button>

              <div className="text-center text-sm">
                <span className="text-slate-500">Chưa nhận được mã? </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isResending}
                  className={`font-semibold transition ${timeLeft > 0 ? "text-slate-400" : "text-primary hover:underline"}`}
                >
                  {isResending ? (
                    <span className="inline-flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Đang gửi...</span>
                  ) : timeLeft > 0 ? (
                    `Gửi lại sau ${timeLeft}s`
                  ) : (
                    "Gửi lại mã OTP"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-7 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">
              NestBooking chỉ sử dụng thông tin tài khoản để đăng nhập, đặt phòng và quản lý chuyến đi. <Link to="/support" className="font-semibold text-primary hover:underline">Cần trợ giúp?</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
