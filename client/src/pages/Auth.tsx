
import { authService } from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type AuthMode = "login" | "register" | "forgot_email" | "forgot_otp" | "forgot_reset";

export default function Auth() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(location.pathname === "/register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useAppStore();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      const accessToken = response.data?.tokens?.accessToken || response.data?.data?.tokens?.accessToken;
      const user = response.data?.user || response.data?.data?.user;

      if (!accessToken) {
        throw new Error("Không nhận được access token");
      }

      setToken(accessToken);
      if (user) setUser(user);

      toast.success("Đăng nhập thành công!");
      navigate(redirect, { replace: true });
    } catch (error: any) {
      console.error("Lỗi đăng nhập", error);
      toast.error(error.response?.data?.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({ email, password, confirmPassword });
      
      const accessToken = response.data?.tokens?.accessToken || response.data?.data?.tokens?.accessToken;
      const user = response.data?.user || response.data?.data?.user;

      if (!accessToken) {
        throw new Error("Không nhận được access token");
      }

      setToken(accessToken);
      if (user) setUser(user);

      toast.success("Đăng ký thành công!");
      navigate(redirect, { replace: true });
    } catch (error: any) {
      console.error("Lỗi đăng ký", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotPasswordOtp = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.sendOtp({ email });
      const receivedToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (receivedToken) {
        setOtpToken(receivedToken);
        setMode("forgot_otp");
        toast.success("Mã OTP đã được gửi đến email của bạn");
      } else {
        throw new Error("Không nhận được OTP token");
      }
    } catch (error: any) {
      console.error("Lỗi gửi OTP", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi mã OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 số");
      return;
    }
    setMode("forgot_reset");
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    
    setLoading(true);
    try {
      await authService.resetPassword({ otp, otpToken, newPassword: password });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpToken("");
    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu", error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "login") await handleLogin();
    else if (mode === "register") await handleRegister();
    else if (mode === "forgot_email") await handleSendForgotPasswordOtp();
    else if (mode === "forgot_otp") await handleVerifyForgotPasswordOtp();
    else if (mode === "forgot_reset") await handleResetPassword();
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-16 mb-20 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-3">
        {mode === "login" && "Đăng nhập"}
        {mode === "register" && "Tạo tài khoản"}
        {mode.startsWith("forgot") && "Khôi phục mật khẩu"}
      </h1>
      <p className="text-slate-600 text-lg mb-10">
        {mode === "login" && "Đăng nhập bằng tài khoản NestBooking để truy cập các dịch vụ."}
        {mode === "register" && "Đăng ký tài khoản để nhận nhiều ưu đãi từ NestBooking."}
        {mode.startsWith("forgot") && "Làm theo các bước để đặt lại mật khẩu của bạn."}
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Field - Shared across multiple modes */}
        {(mode === "login" || mode === "register" || mode === "forgot_email") && (
          <div className="space-y-3">
            <label htmlFor="email" className="text-base font-bold text-slate-900">
              Địa chỉ email
            </label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn" 
              className="w-full h-14 px-5 text-lg rounded-md border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 bg-white"
            />
          </div>
        )}

        {/* OTP Field */}
        {mode === "forgot_otp" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="otp" className="text-base font-bold text-slate-900">
                Mã OTP
              </label>
              <button type="button" onClick={() => setMode("forgot_email")} className="text-sm text-primary hover:underline">
                Thay đổi email
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4 text-center">Mã OTP gồm 6 chữ số đã được gửi đến: <span className="font-semibold text-slate-700">{email}</span></p>
            <div className="flex w-full mt-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                containerClassName="w-full"
                className="w-full"
              >
                <InputOTPGroup className="flex w-full justify-between gap-2 sm:gap-4">
                  <InputOTPSlot index={0} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                  <InputOTPSlot index={1} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                  <InputOTPSlot index={2} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                  <InputOTPSlot index={3} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                  <InputOTPSlot index={4} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                  <InputOTPSlot index={5} className="w-full h-14 sm:h-16 text-2xl font-bold bg-white !border border-slate-300 !rounded-md" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}
        
        {/* Password Field */}
        {(mode === "login" || mode === "register" || mode === "forgot_reset") && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-base font-bold text-slate-900">
                {mode === "forgot_reset" ? "Mật khẩu mới" : "Mật khẩu"}
              </label>
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot_email")} className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu" 
              className="w-full h-14 px-5 text-lg rounded-md border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 bg-white"
            />
          </div>
        )}

        {/* Confirm Password Field */}
        {(mode === "register" || mode === "forgot_reset") && (
          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="text-base font-bold text-slate-900">
              Nhập lại mật khẩu
            </label>
            <input 
              id="confirmPassword"
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu" 
              className="w-full h-14 px-5 text-lg rounded-md border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 bg-white"
            />
          </div>
        )}

        <Button disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-md shadow-md mt-4">
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {mode === "login" && "Đăng nhập"}
          {mode === "register" && "Đăng ký"}
          {mode === "forgot_email" && "Tiếp tục"}
          {mode === "forgot_otp" && "Xác nhận OTP"}
          {mode === "forgot_reset" && "Đổi mật khẩu"}
        </Button>
      </form>

      <div className="text-center mt-6">
        {mode === "login" && (
          <span className="text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <button onClick={() => setMode("register")} className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </button>
          </span>
        )}
        {(mode === "register" || mode.startsWith("forgot")) && (
          <span className="text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
              Đăng nhập
            </button>
          </span>
        )}
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">
            hoặc đăng nhập bằng
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-10">
        <button className="w-20 h-20 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm hover:shadow-md">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-8 h-8" />
        </button>
        <button className="w-20 h-20 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm hover:shadow-md">
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="Github" className="w-9 h-9" />
        </button>
        <button className="w-20 h-20 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm hover:shadow-md">
          <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-8 h-8" />
        </button>
      </div>

      <div className="text-center border-t border-slate-200 pt-8 text-xs text-slate-500 space-y-2">
        <p>
          Bằng cách đăng nhập hoặc tạo tài khoản, bạn đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản và Điều kiện</a> cũng như <a href="#" className="text-primary hover:underline">Chính sách Bảo mật</a> của chúng tôi.
        </p>
        <p>
          Bảo lưu mọi quyền. <br/>
          Bản quyền (2006-2026) - NestBooking™
        </p>
      </div>
    </div>
  );
}

