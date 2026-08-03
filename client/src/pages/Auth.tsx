import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authService } from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAppStore } from "@/stores/useAppStore";
import HeaderBanner from "@/assets/HeaderBanner.jpg";
import { toast } from "sonner";

type AuthMode = "login" | "register" | "forgot_email" | "forgot_otp" | "forgot_reset";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(location.pathname === "/register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAppStore();
  const redirect = searchParams.get("redirect") || "/";
  const isRegister = mode === "register";
  const isForgot = mode.startsWith("forgot");

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpToken("");
    const query = searchParams.toString();
    navigate(`${nextMode === "login" ? "/login" : "/register"}${query ? `?${query}` : ""}`, { replace: true });
  };

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Vui lòng nhập email và mật khẩu");
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const accessToken = response.data?.tokens?.accessToken || response.data?.data?.tokens?.accessToken;
      const user = response.data?.user || response.data?.data?.user;
      if (!accessToken) throw new Error("Không nhận được access token");
      setToken(accessToken);
      if (user) setUser(user);
      toast.success("Đăng nhập thành công");
      navigate(redirect, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) return toast.error("Vui lòng nhập đầy đủ thông tin");
    if (password !== confirmPassword) return toast.error("Mật khẩu không khớp");
    setLoading(true);
    try {
      const response = await authService.register({ email, password, confirmPassword });
      const receivedToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (!receivedToken) throw new Error("Không nhận được OTP token");
      toast.success("Đăng ký thành công, vui lòng kiểm tra email để lấy mã OTP xác thực");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&otpToken=${receivedToken}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };



  const handleSendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email");
    setLoading(true);
    try {
      const response = await authService.sendOtp({ email });
      const receivedToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (!receivedToken) throw new Error("Không nhận được OTP token");
      setOtpToken(receivedToken);
      setMode("forgot_otp");
      toast.success("Mã OTP đã được gửi đến email của bạn");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi mã OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) return toast.error("Vui lòng nhập mật khẩu mới");
    if (password !== confirmPassword) return toast.error("Mật khẩu không khớp");
    setLoading(true);
    try {
      await authService.resetPassword({ otp, otpToken, newPassword: password });
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      switchMode("login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") await handleLogin();
    if (mode === "register") await handleRegister();

    if (mode === "forgot_email") await handleSendOtp();
    if (mode === "forgot_otp") {
      if (otp.length !== 6) return toast.error("Vui lòng nhập mã OTP 6 số");
      setMode("forgot_reset");
    }
    if (mode === "forgot_reset") await handleResetPassword();
  };

  return (
    <div className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-slate-50">
      <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
        <section className={`relative min-h-64 overflow-hidden bg-[#05285d] transition-transform duration-700 ease-in-out lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 ${isRegister ? "lg:translate-x-full" : "lg:translate-x-0"}`}>
          <img src={HeaderBanner} alt="Điểm đến du lịch Việt Nam" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#031b3d]/95 via-[#064c87]/75 to-[#05285d]/35" />
          <div className="absolute -right-16 top-16 h-64 w-64 rounded-full border border-white/15" />
          <div className="relative flex h-full min-h-64 flex-col justify-between p-6 text-white sm:p-10 lg:min-h-full lg:p-14 xl:p-16">
            <div className="hidden lg:block"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 backdrop-blur"><Sparkles className="h-4 w-4" />Hành trình bắt đầu tại đây</div></div>
            <div className="max-w-lg"><h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{isRegister ? "Chào mừng bạn quay lại." : "Lưu giữ hành trình trong một tài khoản."}</h2><p className="mt-4 max-w-md text-sm leading-7 text-blue-100/80 sm:text-base">{isRegister ? "Đăng nhập để tiếp tục quản lý booking và thông tin chuyến đi của bạn." : "Tạo tài khoản để hoàn tất đặt phòng, theo dõi trạng thái và xem lại các chuyến đi."}</p><div className="mt-6 hidden space-y-3 lg:block">{["Theo dõi booking trong tài khoản", "Lưu thông tin liên hệ cho checkout", "Truy cập lịch sử chuyến đi"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-blue-50"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{item}</div>)}</div><Button type="button" variant="outline" onClick={() => switchMode(isRegister ? "login" : "register")} className="mt-7 rounded-xl border-white/25 bg-white/10 px-6 font-bold text-white backdrop-blur hover:bg-white hover:text-[#05285d]">{isRegister ? "Chuyển sang đăng nhập" : "Tạo tài khoản mới"}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            <div className="hidden text-xs text-blue-100/45 lg:block">NestBooking · Tìm kiếm và đặt chỗ nghỉ</div>
          </div>
        </section>

        <section className={`flex min-h-[620px] items-center justify-center px-4 py-10 transition-transform duration-700 ease-in-out sm:px-8 lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 lg:px-12 ${isRegister ? "lg:translate-x-0" : "lg:translate-x-full"}`}>
          <div className="w-full max-w-md">
            <div className="mb-7"><div className="mb-4 flex items-center justify-between"><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">{isForgot ? <KeyRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}{isForgot ? "Khôi phục tài khoản" : "Tài khoản khách hàng"}</div>{isForgot && <button type="button" onClick={() => switchMode("login")} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Đăng nhập</button>}</div><h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{getTitle(mode)}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{getDescription(mode, email)}</p></div>

            {!isForgot && <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => switchMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Đăng nhập</button><button type="button" onClick={() => switchMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Đăng ký</button></div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {(mode === "login" || mode === "register" || mode === "forgot_email") && <AuthField label="Địa chỉ email" icon={Mail}><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full bg-transparent pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" /></AuthField>}

              {mode === "forgot_otp" && <div><div className="mb-3 flex items-center justify-between"><label className="text-sm font-bold text-foreground">Mã xác thực</label><button type="button" onClick={() => setMode("forgot_email")} className="text-xs font-semibold text-primary hover:underline">Đổi email</button></div><InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="w-full"><InputOTPGroup className="grid w-full grid-cols-6 gap-2">{Array.from({ length: 6 }).map((_, index) => <InputOTPSlot key={index} index={index} className="h-12 w-full rounded-xl border border-input bg-background text-lg font-bold text-foreground" />)}</InputOTPGroup></InputOTP></div>}

              {(mode === "login" || mode === "register" || mode === "forgot_reset") && <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-bold text-foreground">{mode === "forgot_reset" ? "Mật khẩu mới" : "Mật khẩu"}</label>{mode === "login" && <button type="button" onClick={() => setMode("forgot_email")} className="text-xs font-semibold text-primary hover:underline">Quên mật khẩu?</button>}</div><div className="relative rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" className="h-12 w-full bg-transparent pl-10 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>}

              {(mode === "register" || mode === "forgot_reset") && <AuthField label="Nhập lại mật khẩu" icon={LockKeyhole}><input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu" className="h-12 w-full bg-transparent pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" /></AuthField>}

              <Button disabled={loading} className="h-12 w-full rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/15">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{getSubmitLabel(mode)}</Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">{mode === "login" ? <>Chưa có tài khoản? <button type="button" onClick={() => switchMode("register")} className="font-bold text-primary hover:underline">Đăng ký ngay</button></> : mode === "register" ? <>Đã có tài khoản? <button type="button" onClick={() => switchMode("login")} className="font-bold text-primary hover:underline">Đăng nhập</button></> : null}</div>
            <div className="mt-7 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">NestBooking chỉ sử dụng thông tin tài khoản để đăng nhập, đặt phòng và quản lý chuyến đi. <Link to="/support" className="font-semibold text-primary hover:underline">Cần trợ giúp?</Link></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthField({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-bold text-foreground">{label}</label><div className="relative rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20"><Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>;
}

function getTitle(mode: AuthMode) {
  if (mode === "login") return "Đăng nhập";
  if (mode === "register") return "Tạo tài khoản";

  if (mode === "forgot_email") return "Quên mật khẩu?";
  if (mode === "forgot_otp") return "Nhập mã OTP";
  return "Đặt mật khẩu mới";
}

function getDescription(mode: AuthMode, email: string) {
  if (mode === "login") return "Tiếp tục đến booking và các chuyến đi đã lưu trong tài khoản.";
  if (mode === "register") return "Tạo tài khoản khách hàng để hoàn tất đặt phòng trên NestBooking.";

  if (mode === "forgot_email") return "Nhập email tài khoản để nhận mã xác thực đặt lại mật khẩu.";
  if (mode === "forgot_otp") return `Mã OTP gồm 6 số đã được gửi đến ${email}.`;
  return "Nhập mật khẩu mới và xác nhận lại để hoàn tất khôi phục.";
}

function getSubmitLabel(mode: AuthMode) {
  if (mode === "login") return "Đăng nhập";
  if (mode === "register") return "Tạo tài khoản";

  if (mode === "forgot_email") return "Gửi mã OTP";
  if (mode === "forgot_otp") return "Xác nhận mã";
  return "Cập nhật mật khẩu";
}
