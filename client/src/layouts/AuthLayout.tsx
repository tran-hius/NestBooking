import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Headphones, MapPin } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative z-50 flex h-[72px] items-center border-b border-slate-200 bg-white">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-slate-900"><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-blue-500/20"><MapPin className="h-5 w-5" /><span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full border border-blue-600 bg-emerald-300" /></span><span className="text-xl font-black tracking-tight sm:text-2xl">NestBooking</span></Link>
          <Link to="/support" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-primary"><Headphones className="h-4 w-4" /><span className="hidden sm:inline">Cần hỗ trợ?</span></Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
