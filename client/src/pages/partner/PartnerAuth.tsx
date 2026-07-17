import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function PartnerAuth() {
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

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                Địa chỉ email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-md">
              Tiếp tục
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
