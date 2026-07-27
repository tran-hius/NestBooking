import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { authService } from "@/api/services/authService";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

export default function PartnerAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useAppStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      const accessToken = response.data?.tokens?.accessToken;
      const user = response.data?.user;

      if (!accessToken || (user?.role !== "PARTNER" && user?.role !== "ADMIN")) {
        toast.error("Tài khoản không có quyền đối tác");
        return;
      }

      setToken(accessToken);
      setUser(user);

      toast.success("Đăng nhập thành công!");
      navigate("/partner");
    } catch (error: any) {
      console.error("Partner Login Error", error);
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="w-full bg-primary h-16 flex items-center px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            NestBooking
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Tạo tài khoản đối tác của bạn
          </h1>
          <p className="text-slate-600 mb-8">
            Tạo tài khoản để đăng tin và quản lý bất động sản của bạn.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                Địa chỉ email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-900 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            <Button disabled={loading} className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-md">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tiếp tục"}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-600 mb-4">
              Bạn có thắc mắc gì về tài sản hoặc hệ thống Extranet? Hãy truy cập{" "}
              <a href="#" className="text-primary hover:underline">
                Trợ giúp đối tác
              </a>
              .
            </p>

            <Link to="/partner/login">
              <Button variant="outline" className="w-full h-12 text-base font-bold text-primary border-primary hover:bg-blue-50 rounded-md">
                Đăng nhập
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-center text-xs text-slate-500">
            <p className="mb-2">
              Bằng cách đăng nhập hoặc tạo tài khoản, bạn đồng ý với{" "}
              <a href="#" className="text-primary hover:underline">Điều khoản và Điều kiện</a>{" "}
              cũng như{" "}
              <a href="#" className="text-primary hover:underline">Tuyên bố về Quyền riêng tư</a> của chúng tôi.
            </p>
            <p>Mọi quyền được bảo lưu.</p>
            <p>Bản quyền (2006-2026) – NestBooking.com™</p>
          </div>
        </div>
      </main>
    </div>
  );
}
