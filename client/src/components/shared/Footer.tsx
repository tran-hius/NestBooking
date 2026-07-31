import { Link } from "react-router-dom";
import { ArrowRight, CalendarRange, Headphones, Mail, MapPin, Search, ShieldCheck } from "lucide-react";

const exploreLinks = [
  { label: "Tìm chỗ nghỉ", href: "/search" },
  { label: "Chuyến đi của tôi", href: "/my-bookings" },
  { label: "Hồ sơ cá nhân", href: "/settings/personal-details" },
];

const partnerLinks = [
  { label: "Đăng ký đối tác", href: "/partner/register" },
  { label: "Kênh quản lý đối tác", href: "/partner/dashboard" },
  { label: "Trung tâm hỗ trợ", href: "/support" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#031b3d] text-blue-100/70">
      <div className="absolute inset-0"><div className="absolute -right-32 -top-36 h-96 w-96 rounded-full border border-white/5" /><div className="absolute right-10 top-16 h-64 w-64 rounded-full bg-cyan-400/[0.05] blur-3xl" /></div>
      <div className="container relative py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
          <div><Link to="/" className="inline-flex items-center gap-2.5 text-white"><span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-950"><MapPin className="h-5 w-5" /><span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full border border-blue-600 bg-emerald-300" /></span><span className="text-2xl font-black tracking-tight">NestBooking</span></Link><p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/60">Nền tảng tìm kiếm và đặt chỗ nghỉ, kết nối khách hàng với các đối tác đang hoạt động trên hệ thống.</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.08] px-3 py-2 text-xs font-semibold text-emerald-200"><ShieldCheck className="h-4 w-4" />Thanh toán VNPay được backend xác minh</div></div>

          <FooterColumn title="Khám phá" links={exploreLinks} />
          <FooterColumn title="Đối tác" links={partnerLinks} />

          <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Hỗ trợ</h3><p className="mt-4 text-sm leading-6 text-blue-100/55">Tìm hướng dẫn sử dụng hoặc gửi email khi bạn cần hỗ trợ thêm.</p><a href="mailto:support@nestbooking.com" className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/[0.1]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300"><Mail className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs text-blue-100/45">Email hỗ trợ</span><span className="block truncate text-sm font-bold text-white">support@nestbooking.com</span></span></a></div>
        </div>

        <div className="mt-12 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3">
          <FooterFeature icon={Search} label="Tìm kiếm rõ ràng" description="Theo điểm đến, ngày và số khách" />
          <FooterFeature icon={CalendarRange} label="Theo dõi booking" description="Trạng thái lưu trú và thanh toán" />
          <FooterFeature icon={Headphones} label="Trung tâm trợ giúp" description="Hướng dẫn theo chức năng thực tế" />
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-blue-100/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} NestBooking. Đồ án lập trình Web.</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><Link to="/support" className="transition hover:text-white">Hỗ trợ</Link><Link to="/partner/register" className="transition hover:text-white">Dành cho đối tác</Link><Link to="/search" className="inline-flex items-center gap-1 font-semibold text-cyan-300 transition hover:text-cyan-200">Khám phá chỗ nghỉ<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">{title}</h3><ul className="mt-4 space-y-3">{links.map((link) => <li key={link.href}><Link to={link.href} className="inline-flex items-center gap-2 text-sm transition hover:translate-x-0.5 hover:text-white"><span className="h-1 w-1 rounded-full bg-cyan-400/60" />{link.label}</Link></li>)}</ul></div>;
}

function FooterFeature({ icon: Icon, label, description }: { icon: typeof Search; label: string; description: string }) {
  return <div className="flex items-center gap-3 rounded-xl px-2 py-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-cyan-300"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-white">{label}</span><span className="mt-0.5 block text-[11px] text-blue-100/45">{description}</span></span></div>;
}
