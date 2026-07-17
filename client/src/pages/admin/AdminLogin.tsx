import { Button } from "@/components/ui/button";
import { Lock, MapPin } from "lucide-react";

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <MapPin className="h-7 w-7" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-white">
          NestBooking Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Hệ thống quản trị dành riêng cho Ban điều hành
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-700">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Tài khoản Admin (Email)
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full h-12 rounded-lg border-0 py-1.5 bg-slate-900 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-4"
                  placeholder="admin@nestbooking.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Mật khẩu
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full h-12 rounded-lg border-0 py-1.5 bg-slate-900 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-4"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-primary hover:text-blue-400">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <Button className="flex w-full h-12 justify-center rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary gap-2">
                <Lock className="w-4 h-4" />
                Đăng nhập hệ thống
              </Button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8">
          Hệ thống bảo mật nội bộ. Mọi hành vi truy cập trái phép đều bị ghi nhận.
        </p>
      </div>
    </div>
  );
}
