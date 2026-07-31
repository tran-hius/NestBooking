import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bookingService } from "@/api/services/bookingService";
import { hotelService } from "@/api/services/hotelService";
import { userService } from "@/api/services/userService";
import { Booking, Hotel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile?: { fullName?: string | null } | null;
}

const bookingStatus = {
  PENDING: { label: "Chờ xác nhận", color: "#f59e0b", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", color: "#2563eb", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", className: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Hoàn thành", color: "#10b981", className: "bg-emerald-100 text-emerald-700" },
} as const;

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
const fullDate = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    Promise.all([bookingService.getAllBookings(), hotelService.getAdminHotels(), userService.getAllUsers()])
      .then(([bookingResponse, hotelResponse, userResponse]) => {
        setBookings(bookingResponse.data);
        setHotels(hotelResponse.data.data);
        setUsers(userResponse.data);
      })
      .catch((error) => {
        console.error("Failed to load admin dashboard:", error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (hasError) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-muted-foreground">Không thể tải dashboard. Vui lòng kiểm tra API và thử lại.</div>;

  const paidRevenue = bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const completedRevenue = bookings.filter((booking) => booking.status === "COMPLETED" && booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const pendingHotels = hotels.filter((hotel) => hotel.status === "PENDING");
  const agents = users.filter((user) => user.role === "AGENT");
  const pendingAgents = agents.filter((user) => user.status === "PENDING");
  const customers = users.filter((user) => user.role === "USER");
  const confirmedBookings = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const completionRate = bookings.length ? Math.round(bookings.filter((booking) => booking.status === "COMPLETED").length / bookings.length * 100) : 0;
  const paymentRate = bookings.length ? Math.round(bookings.filter((booking) => booking.paymentStatus === "PAID").length / bookings.length * 100) : 0;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime())
    .slice(0, 6);

  const bookingTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayBookings = bookings.filter((booking) => {
      const createdAt = new Date(booking.createdAt || booking.checkInDate);
      return createdAt >= date && createdAt < nextDate;
    });
    return {
      date: shortDate.format(date),
      bookings: dayBookings.length,
      revenue: dayBookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0),
    };
  });

  const statusData = Object.entries(bookingStatus).map(([status, config]) => ({
    name: config.label,
    value: bookings.filter((booking) => booking.status === status).length,
    color: config.color,
  }));

  const cityStats = Array.from(
    hotels.reduce((map, hotel) => map.set(hotel.city, (map.get(hotel.city) || 0) + 1), new Map<string, number>()).entries(),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCityCount = cityStats[0]?.[1] || 1;

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#062a5e] px-6 py-7 text-white shadow-[0_18px_50px_rgba(6,42,94,0.22)] md:px-8 md:py-9">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-blue-300/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              <ShieldCheck className="h-4 w-4" /> Operations center
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chào buổi sáng, Admin</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 md:text-base">Tình hình vận hành NestBooking được tổng hợp từ dữ liệu booking, thanh toán và kiểm duyệt theo thời gian thực.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
            <HeroMetric label="Doanh thu đã thanh toán" value={currency.format(paidRevenue)} hint={`${currency.format(completedRevenue)} đã hoàn thành`} />
            <HeroMetric label="Cần xử lý" value={String(pendingHotels.length + pendingAgents.length)} hint={`${pendingHotels.length} chỗ nghỉ · ${pendingAgents.length} đối tác`} accent />
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Hiệu suất hệ thống</h2><p className="mt-1 text-sm text-muted-foreground">{fullDate.format(new Date())}</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" asChild><Link to="/admin/hotels">Kiểm duyệt chỗ nghỉ</Link></Button><Button size="sm" asChild><Link to="/admin/bookings">Quản lý booking<ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CalendarCheck} label="Tổng booking" value={bookings.length.toLocaleString("vi-VN")} detail={`${confirmedBookings} booking đang xác nhận`} tone="blue" progress={bookings.length ? confirmedBookings / bookings.length * 100 : 0} />
        <KpiCard icon={CheckCircle2} label="Tỷ lệ hoàn thành" value={`${completionRate}%`} detail={`${bookings.filter((booking) => booking.status === "COMPLETED").length} booking hoàn tất`} tone="emerald" progress={completionRate} />
        <KpiCard icon={Building2} label="Chỗ nghỉ hoạt động" value={activeHotels.toLocaleString("vi-VN")} detail={`${pendingHotels.length} hồ sơ chờ duyệt`} tone="violet" progress={hotels.length ? activeHotels / hotels.length * 100 : 0} />
        <KpiCard icon={UsersRound} label="Khách hàng" value={customers.length.toLocaleString("vi-VN")} detail={`${agents.length} tài khoản đối tác`} tone="orange" progress={users.length ? customers.length / users.length * 100 : 0} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2"><div><CardTitle className="text-lg">Booking trong 7 ngày</CardTitle><p className="mt-1 text-sm text-muted-foreground">Số booking tạo mới theo ngày</p></div><Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{bookings.length} tổng cộng</Badge></CardHeader>
          <CardContent className="pt-4">
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingTrend} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                  <defs><linearGradient id="bookingBars" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1379c8" /><stop offset="100%" stopColor="#4ba3e3" /></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#eff6ff" }} contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} formatter={(value) => [`${value} booking`, "Số lượng"]} />
                  <Bar dataKey="bookings" fill="url(#bookingBars)" radius={[8, 8, 2, 2]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
          <CardHeader><CardTitle className="text-lg">Trạng thái booking</CardTitle><p className="text-sm text-muted-foreground">Cơ cấu trên toàn hệ thống</p></CardHeader>
          <CardContent>
            <div className="relative mx-auto h-[190px] max-w-[280px]">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4} stroke="none">{statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} /></PieChart></ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold text-slate-900 dark:text-white">{bookings.length}</span><span className="text-xs text-muted-foreground">booking</span></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">{statusData.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-zinc-900"><span className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="text-sm font-bold">{item.value}</span></div>)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">Hoạt động booking mới nhất</CardTitle><p className="mt-1 text-sm text-muted-foreground">Theo thời điểm booking được tạo</p></div><Button variant="ghost" size="sm" asChild><Link to="/admin/bookings">Xem tất cả<ArrowRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader>
          <CardContent className="px-0 pb-2">
            {recentBookings.length ? <div className="divide-y divide-slate-100 dark:divide-zinc-800">{recentBookings.map((booking) => <div key={booking.id} className="grid gap-3 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:grid-cols-[1fr_auto] sm:items-center dark:hover:bg-zinc-900"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">{booking.guestName.charAt(0).toUpperCase()}</div><div className="min-w-0"><div className="truncate font-semibold text-slate-900 dark:text-white">{booking.guestName}</div><div className="truncate text-xs text-muted-foreground">{booking.bookingCode} · {booking.hotel?.name || "Chỗ nghỉ"}</div></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><div className="font-semibold text-slate-800 dark:text-zinc-100">{currency.format(Number(booking.totalAmount))}</div><div className="text-xs text-muted-foreground">{booking.createdAt ? shortDate.format(new Date(booking.createdAt)) : ""}</div></div><Badge className={bookingStatus[booking.status].className}>{bookingStatus[booking.status].label}</Badge></div></div>)}</div> : <p className="px-6 py-12 text-center text-muted-foreground">Chưa có booking.</p>}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-0 bg-[#0b4b91] text-white shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock3 className="h-5 w-5 text-cyan-300" />Hàng chờ kiểm duyệt</CardTitle></CardHeader>
            <CardContent className="space-y-3"><QueueItem icon={BedDouble} label="Chỗ nghỉ chờ duyệt" value={pendingHotels.length} href="/admin/hotels" /><QueueItem icon={UserRound} label="Đối tác chờ duyệt" value={pendingAgents.length} href="/admin/agents" /><div className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-blue-100">Xử lý hồ sơ chờ duyệt giúp nội dung mới xuất hiện đúng hạn trên nền tảng.</div></CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Thị trường nổi bật</CardTitle><p className="text-sm text-muted-foreground">Theo số lượng chỗ nghỉ</p></CardHeader>
            <CardContent className="space-y-4">{cityStats.map(([city, count], index) => <div key={city}><div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-medium text-slate-700 dark:text-zinc-200">{index + 1}. {city}</span><span className="font-semibold">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${count / maxCityCount * 100}%` }} /></div></div>)}</CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniInsight label="Tỷ lệ thanh toán" value={`${paymentRate}%`} icon={CircleDollarSign} />
        <MiniInsight label="Tổng tài khoản" value={users.length.toLocaleString("vi-VN")} icon={UserRound} />
        <MiniInsight label="Tổng chỗ nghỉ" value={hotels.length.toLocaleString("vi-VN")} icon={Building2} />
      </div>
    </div>
  );
}

function HeroMetric({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return <div className={`rounded-2xl border p-4 backdrop-blur ${accent ? "border-amber-300/30 bg-amber-300/10" : "border-white/15 bg-white/10"}`}><div className="text-xs font-medium text-blue-100">{label}</div><div className="mt-1 truncate text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-blue-200">{hint}</div></div>;
}

function KpiCard({ icon: Icon, label, value, detail, tone, progress }: { icon: typeof CalendarCheck; label: string; value: string; detail: string; tone: "blue" | "emerald" | "violet" | "orange"; progress: number }) {
  const tones = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700", orange: "bg-orange-50 text-orange-700" };
  const bars = { blue: "bg-blue-600", emerald: "bg-emerald-500", violet: "bg-violet-500", orange: "bg-orange-500" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md dark:ring-zinc-800"><CardContent className="p-5"><div className="flex items-start justify-between"><div><div className="text-sm font-medium text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div></div><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div><div className="mt-4 text-xs text-muted-foreground">{detail}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${bars[tone]}`} style={{ width: `${Math.min(100, progress)}%` }} /></div></CardContent></Card>;
}

function QueueItem({ icon: Icon, label, value, href }: { icon: typeof BedDouble; label: string; value: number; href: string }) {
  return <Link to={href} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 p-3.5 transition-colors hover:bg-white/15"><span className="flex items-center gap-3 text-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><Icon className="h-4 w-4" /></span>{label}</span><span className="flex items-center gap-2 text-xl font-bold">{value}<ArrowRight className="h-4 w-4 text-blue-200" /></span></Link>;
}

function MiniInsight({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CircleDollarSign }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"><Icon className="h-5 w-5" /></span><div><div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div><div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div></div></div>;
}

function DashboardSkeleton() {
  return <div className="space-y-6 animate-pulse"><div className="h-56 rounded-[28px] bg-slate-200" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 rounded-xl bg-slate-200" />)}</div><div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]"><div className="h-96 rounded-xl bg-slate-200" /><div className="h-96 rounded-xl bg-slate-200" /></div></div>;
}
