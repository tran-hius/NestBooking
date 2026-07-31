import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  TrendingUp,
  WalletCards,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/stores/useAppStore";
import type { Booking, BookingStatus, Hotel } from "@/types";

const bookingStatus: Record<BookingStatus, { label: string; color: string; className: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "#f59e0b", className: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300" },
  CONFIRMED: { label: "Đã xác nhận", color: "#2563eb", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", className: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300" },
  COMPLETED: { label: "Hoàn thành", color: "#10b981", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300" },
};

const hotelStatus: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300" },
  INACTIVE: { label: "Tạm ngưng", className: "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300" },
  REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300" },
};

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
const fullDate = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

export default function AgentDashboard() {
  const user = useAppStore((state) => state.user);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const hotelResponse = await hotelService.getMyHotels();
        const hotelList = hotelResponse.data.data;
        setHotels(hotelList);

        const bookingResponses = await Promise.allSettled(hotelList.map((hotel) => bookingService.getHotelBookings(hotel.id)));
        const bookingList = bookingResponses.flatMap((response) => response.status === "fulfilled" ? response.value.data : []);
        setBookings(bookingList);
        setHasError(bookingResponses.some((response) => response.status === "rejected"));
      } catch (error) {
        console.error("Failed to load partner dashboard:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const today = startOfDay(new Date());
  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const pendingHotels = hotels.filter((hotel) => hotel.status === "PENDING").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const paidRevenue = bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const completedRevenue = bookings.filter((booking) => booking.status === "COMPLETED").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const completionRate = bookings.length ? Math.round(completedBookings / bookings.length * 100) : 0;
  const paymentRate = bookings.length ? Math.round(bookings.filter((booking) => booking.paymentStatus === "PAID").length / bookings.length * 100) : 0;
  const arrivalsToday = bookings.filter((booking) => booking.status === "CONFIRMED" && isSameDay(new Date(booking.checkInDate), today)).length;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime())
    .slice(0, 6);

  const upcomingStays = bookings
    .filter((booking) => booking.status !== "CANCELLED" && startOfDay(new Date(booking.checkInDate)) >= today)
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
    .slice(0, 5);

  const bookingTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dailyBookings = bookings.filter((booking) => {
      const createdAt = new Date(booking.createdAt || booking.checkInDate);
      return createdAt >= date && createdAt < nextDate;
    });
    return { date: shortDate.format(date), bookings: dailyBookings.length };
  });

  const statusData = Object.entries(bookingStatus).map(([status, config]) => ({
    name: config.label,
    value: bookings.filter((booking) => booking.status === status).length,
    color: config.color,
  }));

  const hotelPerformance = hotels.map((hotel) => {
    const hotelBookings = bookings.filter((booking) => booking.hotelId === hotel.id);
    return {
      hotel,
      bookings: hotelBookings.length,
      upcoming: hotelBookings.filter((booking) => booking.status === "CONFIRMED" && startOfDay(new Date(booking.checkInDate)) >= today).length,
      revenue: hotelBookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0),
    };
  }).sort((a, b) => b.bookings - a.bookings);

  const displayName = user?.profile?.fullName?.trim().split(/\s+/).at(-1) || "Đối tác";
  const greeting = getGreeting();

  return (
    <div className="space-y-6 pb-8">
      {hasError && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <span>Một phần dữ liệu chưa tải được. Các số liệu bên dưới có thể chưa đầy đủ.</span>
          <Button variant="outline" size="sm" className="shrink-0 border-amber-300 bg-white/70" onClick={() => window.location.reload()}><RefreshCw className="mr-1.5 h-4 w-4" />Tải lại</Button>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[28px] bg-[#063a55] px-6 py-7 text-white shadow-[0_18px_50px_rgba(6,58,85,0.22)] md:px-8 md:py-9">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100"><TrendingUp className="h-4 w-4" />Partner performance</div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{greeting}, {displayName}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cyan-50/80 md:text-base">Theo dõi booking, doanh thu và lịch khách đến của toàn bộ chỗ nghỉ trong một màn hình vận hành.</p>
            <div className="mt-6 flex flex-wrap gap-2.5"><Button asChild className="rounded-xl bg-emerald-400 font-bold text-emerald-950 hover:bg-emerald-300"><Link to="/partner/bookings">Xử lý booking<ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button><Button variant="outline" asChild className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"><Link to="/partner/property-type"><Plus className="mr-1.5 h-4 w-4" />Thêm chỗ nghỉ</Link></Button></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
            <HeroMetric label="Doanh thu đã thanh toán" value={currency.format(paidRevenue)} hint={`${currency.format(completedRevenue)} từ booking hoàn thành`} />
            <HeroMetric label="Cần xử lý" value={String(pendingBookings + pendingHotels)} hint={`${pendingBookings} booking · ${pendingHotels} chỗ nghỉ chờ duyệt`} accent />
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Tình hình kinh doanh</h2><p className="mt-1 text-sm capitalize text-muted-foreground">{fullDate.format(new Date())}</p></div>
        <Button variant="outline" size="sm" asChild><Link to="/partner/hotels">Quản lý chỗ nghỉ<ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CalendarCheck} label="Tổng booking" value={bookings.length.toLocaleString("vi-VN")} detail={`${confirmedBookings} booking đã xác nhận`} tone="blue" progress={bookings.length ? confirmedBookings / bookings.length * 100 : 0} />
        <KpiCard icon={Clock3} label="Chờ xác nhận" value={pendingBookings.toLocaleString("vi-VN")} detail={pendingBookings ? "Cần phản hồi khách sớm" : "Không có booking tồn đọng"} tone="amber" progress={bookings.length ? pendingBookings / bookings.length * 100 : 0} />
        <KpiCard icon={CheckCircle2} label="Tỷ lệ hoàn thành" value={`${completionRate}%`} detail={`${completedBookings} booking đã hoàn tất`} tone="emerald" progress={completionRate} />
        <KpiCard icon={Building2} label="Chỗ nghỉ hoạt động" value={activeHotels.toLocaleString("vi-VN")} detail={`${hotels.length} chỗ nghỉ đang quản lý`} tone="violet" progress={hotels.length ? activeHotels / hotels.length * 100 : 0} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2"><div><CardTitle className="text-lg">Booking trong 7 ngày</CardTitle><p className="mt-1 text-sm text-muted-foreground">Số booking mới được tạo theo ngày</p></div><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{bookings.length} tổng cộng</Badge></CardHeader>
          <CardContent className="pt-4">
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingTrend} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                  <defs><linearGradient id="partnerBookingBars" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#ecfdf5" }} contentStyle={{ borderRadius: 12, border: "1px solid #d1fae5", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} formatter={(value) => [`${value} booking`, "Số lượng"]} />
                  <Bar dataKey="bookings" fill="url(#partnerBookingBars)" radius={[8, 8, 2, 2]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
          <CardHeader><CardTitle className="text-lg">Trạng thái booking</CardTitle><p className="text-sm text-muted-foreground">Cơ cấu booking tại các chỗ nghỉ</p></CardHeader>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">Booking mới nhất</CardTitle><p className="mt-1 text-sm text-muted-foreground">Hoạt động gần đây tại tất cả chỗ nghỉ</p></div><Button variant="ghost" size="sm" asChild><Link to="/partner/bookings">Xem tất cả<ArrowRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader>
          <CardContent className="px-0 pb-2">
            {recentBookings.length ? <div className="divide-y divide-slate-100 dark:divide-zinc-800">{recentBookings.map((booking) => <Link key={booking.id} to={`/partner/bookings?hotelId=${booking.hotelId}`} className="grid gap-3 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:grid-cols-[1fr_auto] sm:items-center dark:hover:bg-zinc-900"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{booking.guestName.charAt(0).toUpperCase()}</div><div className="min-w-0"><div className="truncate font-semibold text-slate-900 dark:text-white">{booking.guestName}</div><div className="truncate text-xs text-muted-foreground">{booking.bookingCode} · {booking.hotel?.name || hotelName(hotels, booking.hotelId)}</div></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><div className="font-semibold text-slate-800 dark:text-zinc-100">{currency.format(Number(booking.totalAmount))}</div><div className="text-xs text-muted-foreground">{booking.createdAt ? shortDate.format(new Date(booking.createdAt)) : ""}</div></div><Badge className={bookingStatus[booking.status].className}>{bookingStatus[booking.status].label}</Badge></div></Link>)}</div> : <EmptyState icon={CalendarCheck} title="Chưa có booking" description="Booking mới sẽ xuất hiện tại đây khi khách đặt phòng." />}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-0 bg-[#075d65] text-white shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarClock className="h-5 w-5 text-cyan-300" />Lịch khách sắp tới</CardTitle><p className="text-sm text-cyan-50/70">Các lượt nhận phòng gần nhất</p></CardHeader>
            <CardContent className="space-y-2.5">{upcomingStays.length ? upcomingStays.map((booking) => <Link key={booking.id} to={`/partner/bookings?hotelId=${booking.hotelId}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/10 p-3 transition-colors hover:bg-white/15"><div className="min-w-0"><div className="truncate text-sm font-semibold">{booking.guestName}</div><div className="mt-0.5 truncate text-xs text-cyan-50/70">{booking.hotel?.name || hotelName(hotels, booking.hotelId)}</div></div><div className="shrink-0 text-right"><div className="text-sm font-bold">{shortDate.format(new Date(booking.checkInDate))}</div><div className="text-[11px] text-cyan-100/70">{booking.quantity} phòng</div></div></Link>) : <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-cyan-50/70">Chưa có lịch nhận phòng sắp tới.</p>}<Button variant="ghost" asChild className="mt-1 w-full text-cyan-50 hover:bg-white/10 hover:text-white"><Link to="/partner/bookings">Mở lịch đặt phòng<ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button></CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Việc cần chú ý</CardTitle><p className="text-sm text-muted-foreground">Tóm tắt vận hành hôm nay</p></CardHeader>
            <CardContent className="space-y-3"><AttentionItem icon={Clock3} label="Booking chờ xác nhận" value={pendingBookings} tone="amber" /><AttentionItem icon={BedDouble} label="Khách nhận phòng hôm nay" value={arrivalsToday} tone="blue" /><AttentionItem icon={Building2} label="Chỗ nghỉ chờ duyệt" value={pendingHotels} tone="violet" /></CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">Hiệu suất theo chỗ nghỉ</CardTitle><p className="mt-1 text-sm text-muted-foreground">Booking và doanh thu đã thanh toán của từng cơ sở</p></div><Button variant="ghost" size="sm" asChild><Link to="/partner/hotels">Quản lý<ArrowRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader>
        <CardContent className="px-0 pb-2">
          {hotelPerformance.length ? <div className="divide-y divide-slate-100 dark:divide-zinc-800">{hotelPerformance.map(({ hotel, bookings: count, upcoming, revenue }) => <Link key={hotel.id} to={`/partner/hotels/${hotel.id}`} className="grid gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(100px,auto))] md:items-center dark:hover:bg-zinc-900"><div className="flex min-w-0 items-center gap-3"><HotelThumbnail hotel={hotel} /><div className="min-w-0"><div className="truncate font-semibold text-slate-900 dark:text-white">{hotel.name}</div><div className="truncate text-xs text-muted-foreground">{hotel.city} · {hotel.roomTypes?.length || 0} loại phòng</div></div></div><Metric label="Booking" value={String(count)} /><Metric label="Sắp nhận phòng" value={String(upcoming)} /><div className="flex items-center justify-between gap-4 md:block md:text-right"><div><div className="text-xs text-muted-foreground">Doanh thu</div><div className="mt-0.5 font-bold text-slate-900 dark:text-white">{currency.format(revenue)}</div></div><Badge className={`md:mt-1.5 ${hotelStatus[hotel.status]?.className || hotelStatus.INACTIVE.className}`}>{hotelStatus[hotel.status]?.label || hotel.status}</Badge></div></Link>)}</div> : <EmptyState icon={Building2} title="Chưa có chỗ nghỉ" description="Tạo chỗ nghỉ đầu tiên để bắt đầu quản lý phòng và nhận booking." action={<Button asChild><Link to="/partner/property-type"><Plus className="mr-1.5 h-4 w-4" />Tạo chỗ nghỉ</Link></Button>} />}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniInsight label="Tỷ lệ thanh toán" value={`${paymentRate}%`} icon={WalletCards} />
        <MiniInsight label="Booking sắp tới" value={upcomingStays.length.toLocaleString("vi-VN")} icon={CalendarClock} />
        <MiniInsight label="Tổng chỗ nghỉ" value={hotels.length.toLocaleString("vi-VN")} icon={Building2} />
      </div>
    </div>
  );
}

function HeroMetric({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return <div className={`rounded-2xl border p-4 backdrop-blur ${accent ? "border-amber-300/30 bg-amber-300/10" : "border-white/15 bg-white/10"}`}><div className="text-xs font-medium text-cyan-50/75">{label}</div><div className="mt-1 truncate text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-cyan-100/70">{hint}</div></div>;
}

function KpiCard({ icon: Icon, label, value, detail, tone, progress }: { icon: LucideIcon; label: string; value: string; detail: string; tone: "blue" | "amber" | "emerald" | "violet"; progress: number }) {
  const tones = { blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300", violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" };
  const bars = { blue: "bg-blue-600", amber: "bg-amber-500", emerald: "bg-emerald-500", violet: "bg-violet-500" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md dark:ring-zinc-800"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-medium text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div></div><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div><div className="mt-4 text-xs text-muted-foreground">{detail}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${bars[tone]}`} style={{ width: `${Math.min(100, progress)}%` }} /></div></CardContent></Card>;
}

function AttentionItem({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "amber" | "blue" | "violet" }) {
  const tones = { amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" };
  return <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-zinc-800"><span className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-200"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span>{label}</span><span className="text-xl font-bold text-slate-900 dark:text-white">{value}</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between md:block md:text-center"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{value}</div></div>;
}

function MiniInsight({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"><Icon className="h-5 w-5" /></span><div><div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div><div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div></div></div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-12 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-300"><Icon className="h-6 w-6" /></span><div className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</div><p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

function HotelThumbnail({ hotel }: { hotel: Hotel }) {
  const imageUrl = hotel.thumbnail || hotel.images?.[0]?.imageUrl;
  return imageUrl ? <img src={imageUrl} alt="" className="h-12 w-16 shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-zinc-800" /> : <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-800"><Building2 className="h-5 w-5" /></span>;
}

function DashboardSkeleton() {
  return <div className="animate-pulse space-y-6"><div className="h-64 rounded-[28px] bg-slate-200 dark:bg-zinc-800" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 rounded-xl bg-slate-200 dark:bg-zinc-800" />)}</div><div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]"><div className="h-96 rounded-xl bg-slate-200 dark:bg-zinc-800" /><div className="h-96 rounded-xl bg-slate-200 dark:bg-zinc-800" /></div></div>;
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function hotelName(hotels: Hotel[], hotelId: string) {
  return hotels.find((hotel) => hotel.id === hotelId)?.name || "Chỗ nghỉ";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}
