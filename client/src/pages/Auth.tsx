import { authService } from "@/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) return;

    setLoading(true);
    try {
      const result: any = await authService.sendOtp({ email });
      console.log("result", result);
      const otpToken = result?.data?.otpToken || result?.otpToken || result?.data?.data?.otpToken;
      navigate(`/verify-otp?token=${otpToken}`, { state: { email } });
    } catch (error) {
      console.error("Lỗi gửi OTP", error);
      toast.error("Có lỗi xảy ra khi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-16 mb-20 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-3">Đăng nhập hoặc tạo tài khoản</h1>
      <p className="text-slate-600 text-lg mb-10">
        Bạn có thể đăng nhập bằng tài khoản NestBooking để truy cập các dịch vụ của chúng tôi.
      </p>

      <form className="space-y-8" onSubmit={handleSubmit}>
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
            className="w-full h-14 px-5 text-lg rounded-md border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <Button disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-md shadow-md">
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Tiếp tục với email
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">
            hoặc sử dụng một trong các tùy chọn này
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

      <div className="text-center mb-12">
        <p className="text-sm text-slate-600">
          Bạn không thể truy cập email? <a href="#" className="text-primary hover:underline font-medium">Khôi phục tài khoản</a>
        </p>
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
