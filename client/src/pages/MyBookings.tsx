import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Hotel,
  MapPin,
  RefreshCw,
  Search,
  TicketCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import { bookingService } from "@/api/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Booking, BookingStatus, PaymentStatus } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

const statusConfig: Record<BookingStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  PENDING: { label: "Chờ xác nhận", className: "border-amber-200 bg-amber-50 text-amber-700", icon: Clock3 },
  CONFIRMED: { label: "Đã xác nhận", className: "border-blue-200 bg-blue-50 text-blue-700", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-700", icon: XCircle },
  COMPLETED: { label: "Đã hoàn thành", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CalendarCheck2 },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Chưa thanh toán", className: "bg-amber-50 text-amber-700" },
  PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-violet-50 text-violet-700" },
};

const fallbackImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85";

export default function MyBookings() {
  const { isAuthenticated } = useAppStore();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "Không thể tải danh sách đặt phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) void fetchBookings(); }, [isAuthenticated]);
  useEffect(() => { if (searchParams.get("created")) toast.success("Booking mới đã được thêm vào chuyến đi của bạn."); }, [searchParams]);

  if (!isAuthenticated) return <Navigate to="/login?redirect=/my-bookings" replace />;

  const filtered = bookings
    .filter((booking) => status === "ALL" || booking.status === status)
    .filter((booking) => !search.trim() || `${booking.bookingCode} ${booking.hotel?.name || ""} ${booking.roomType?.name || ""}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  const upcoming = bookings.filter((booking) => ["PENDING", "CONFIRMED"].includes(booking.status)).length;
  const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const paidAmount = bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const response = await bookingService.cancelBooking(cancelTarget.id);
      setBookings((current) => current.map((booking) => booking.id === cancelTarget.id ? { ...booking, ...response.data } : booking));
      setSelectedBooking((current) => current?.id === cancelTarget.id ? { ...current, ...response.data } : current);
      toast.success(`Đã hủy booking ${cancelTarget.bookingCode}`);
      setCancelTarget(null);
    } catch (requestError: any) {
      toast.error(requestError.response?.data?.message || "Không thể hủy đặt phòng");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-20 pt-24">
      <section className="relative overflow-hidden bg-[#05285d] py-12 text-white md:py-14"><div className="absolute inset-0"><div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" /><div className="absolute right-20 top-4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" /></div><div className="container relative"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300"><TicketCheck className="h-4 w-4" />Travel dashboard</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">Chuyến đi của tôi</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/70">Theo dõi booking, lịch lưu trú và trạng thái thanh toán trong một nơi.</p></div><Button asChild className="w-fit rounded-xl bg-white font-bold text-[#05285d] hover:bg-blue-50"><Link to="/search">Tìm chuyến đi mới<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div></section>

      <div className="container relative -mt-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={CalendarDays} label="Tổng booking" value={bookings.length.toString()} hint="Tất cả chuyến đi" tone="blue" /><StatCard icon={Clock3} label="Sắp tới" value={upcoming.toString()} hint="Chờ hoặc đã xác nhận" tone="amber" /><StatCard icon={CalendarCheck2} label="Đã hoàn thành" value={completed.toString()} hint="Kỳ lưu trú kết thúc" tone="emerald" /><StatCard icon={Banknote} label="Đã thanh toán" value={compactCurrency(paidAmount)} hint="Tổng giá trị booking paid" tone="violet" /></div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10" placeholder="Tìm mã booking, khách sạn hoặc loại phòng" /></div><div className="flex gap-2"><Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}><SelectTrigger className="h-10 min-w-44 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="PENDING">Chờ xác nhận</SelectItem><SelectItem value="CONFIRMED">Đã xác nhận</SelectItem><SelectItem value="COMPLETED">Đã hoàn thành</SelectItem><SelectItem value="CANCELLED">Đã hủy</SelectItem></SelectContent></Select><Button variant="outline" size="icon" aria-label="Làm mới booking" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => void fetchBookings()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button></div></div></div>

        <div className="mt-6">
          {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <BookingSkeleton key={index} />)}</div> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 py-14 text-center text-red-700"><XCircle className="mx-auto h-9 w-9" /><p className="mt-3 font-semibold">{error}</p><Button variant="outline" className="mt-4 rounded-xl" onClick={() => void fetchBookings()}>Thử lại</Button></div> : filtered.length ? <div className="space-y-4">{filtered.map((booking) => <BookingCard key={booking.id} booking={booking} onView={setSelectedBooking} onCancel={setCancelTarget} />)}</div> : <EmptyState hasBookings={bookings.length > 0} />}
        </div>
      </div>

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}><DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl p-0">{selectedBooking && <><div className="bg-gradient-to-r from-[#05285d] to-[#0a78c5] p-6 text-white"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">Chi tiết booking</div><DialogTitle className="mt-1 text-2xl text-white">{selectedBooking.bookingCode}</DialogTitle><DialogDescription className="mt-1 text-blue-100">Tạo {selectedBooking.createdAt ? formatDateTime(selectedBooking.createdAt) : "không xác định"}</DialogDescription></div><StatusBadge status={selectedBooking.status} /></div></div><div className="space-y-5 p-6"><div className="grid gap-3 sm:grid-cols-2"><DetailCard icon={Hotel} label="Chỗ nghỉ" value={selectedBooking.hotel?.name || selectedBooking.hotelId} /><DetailCard icon={BedDouble} label="Loại phòng" value={`${selectedBooking.roomType?.name || selectedBooking.roomTypeId} · ${selectedBooking.quantity} phòng`} /><DetailCard icon={CalendarDays} label="Lịch lưu trú" value={`${formatDate(selectedBooking.checkInDate)} - ${formatDate(selectedBooking.checkOutDate)} (${getNights(selectedBooking)} đêm)`} /><DetailCard icon={Banknote} label="Tổng tiền" value={formatCurrency(selectedBooking.totalAmount)} /></div><div className="grid gap-4 sm:grid-cols-2"><InfoBlock title="Thanh toán" lines={[paymentConfig[selectedBooking.paymentStatus].label, paymentMethodLabel(selectedBooking.paymentMethod), selectedBooking.transactionId ? `Mã GD: ${selectedBooking.transactionId}` : "Chưa có mã giao dịch"]} /><InfoBlock title="Khách lưu trú" lines={[selectedBooking.guestName, selectedBooking.guestPhone, selectedBooking.guestEmail]} /></div>{selectedBooking.specialRequests && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="text-xs font-bold uppercase tracking-wide text-amber-700">Yêu cầu đặc biệt</div><p className="mt-2 text-sm leading-relaxed text-slate-700">{selectedBooking.specialRequests}</p></div>}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><Button variant="outline" asChild className="rounded-xl"><Link to={`/hotel/${selectedBooking.hotelId}`}><Hotel className="mr-2 h-4 w-4" />Xem chỗ nghỉ</Link></Button>{canCancel(selectedBooking) && <Button variant="destructive" onClick={() => setCancelTarget(selectedBooking)} className="rounded-xl"><XCircle className="mr-2 h-4 w-4" />Hủy đặt phòng</Button>}</div></div></>}</DialogContent></Dialog>

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => { if (!open && !cancelling) setCancelTarget(null); }}><DialogContent className="max-w-md rounded-2xl"><DialogHeader><div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><XCircle className="h-6 w-6" /></div><DialogTitle>Hủy đặt phòng?</DialogTitle><DialogDescription>Booking <strong>{cancelTarget?.bookingCode}</strong> sẽ chuyển sang trạng thái đã hủy và không thể khôi phục bằng giao diện hiện tại.</DialogDescription></DialogHeader><DialogFooter className="mt-3"><Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>Quay lại</Button><Button variant="destructive" onClick={() => void cancelBooking()} disabled={cancelling}>{cancelling ? "Đang hủy..." : "Xác nhận hủy"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function BookingCard({ booking, onView, onCancel }: { booking: Booking; onView: (booking: Booking) => void; onCancel: (booking: Booking) => void }) {
  const image = booking.hotel?.images?.[0]?.imageUrl || fallbackImage;
  return <article className="group grid overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-lg md:grid-cols-[230px_1fr]"><div className="relative min-h-52 overflow-hidden bg-slate-100"><img src={image} alt={booking.hotel?.name || "Chỗ nghỉ"} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" /><div className="absolute left-3 top-3"><StatusBadge status={booking.status} /></div><div className="absolute bottom-3 left-3 text-xs font-bold text-white">{booking.bookingCode}</div></div><div className="flex min-w-0 flex-col p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><Link to={`/hotel/${booking.hotelId}`} className="text-xl font-black text-slate-900 transition hover:text-primary">{booking.hotel?.name || "Chỗ nghỉ"}</Link><div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="line-clamp-2">{booking.hotel?.address || booking.hotel?.city || "Địa chỉ chưa cập nhật"}</span></div></div><PaymentBadge status={booking.paymentStatus} /></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]"><DateBlock label="Nhận phòng" value={formatDate(booking.checkInDate)} /><div className="hidden items-center text-xs font-semibold text-slate-400 sm:flex">{getNights(booking)} đêm</div><DateBlock label="Trả phòng" value={formatDate(booking.checkOutDate)} /><div className="rounded-xl bg-slate-50 px-3 py-2 text-right"><div className="text-xs text-slate-400">Tổng tiền</div><div className="mt-0.5 whitespace-nowrap font-black text-slate-900">{formatCurrency(booking.totalAmount)}</div></div></div><div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-slate-600"><BedDouble className="h-4 w-4 text-primary" />{booking.roomType?.name || "Phòng đã chọn"} · {booking.quantity} phòng</div><div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-lg" onClick={() => onView(booking)}><Eye className="mr-1.5 h-4 w-4" />Chi tiết</Button>{canCancel(booking) && <Button variant="outline" size="sm" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onCancel(booking)}>Hủy booking</Button>}</div></div></div></article>;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return <Badge variant="outline" className={`whitespace-nowrap px-2.5 py-1 ${config.className}`}><Icon className="mr-1.5 h-3.5 w-3.5" />{config.label}</Badge>;
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status];
  return <span className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold ${config.className}`}><WalletCards className="h-3.5 w-3.5" />{config.label}</span>;
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof CalendarDays; label: string; value: string; hint: string; tone: "blue" | "amber" | "emerald" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", emerald: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-slate-500">{label}</div><div className="mt-0.5 truncate text-2xl font-black text-slate-900">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function DetailCard({ icon: Icon, label, value }: { icon: typeof Hotel; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"><Icon className="mb-2 h-4 w-4 text-primary" /><div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{value}</div></div>;
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return <div className="rounded-xl border border-slate-200 p-4"><div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</div>{lines.map((line, index) => <div key={`${line}-${index}`} className="mt-1 break-all text-sm text-slate-700">{line}</div>)}</div>;
}

function DateBlock({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-blue-50/60 px-3 py-2"><div className="text-xs text-slate-400">{label}</div><div className="mt-0.5 font-bold text-slate-800">{value}</div></div>;
}

function BookingSkeleton() {
  return <div className="grid animate-pulse overflow-hidden rounded-[22px] border border-slate-200 bg-white md:grid-cols-[230px_1fr]"><div className="min-h-52 bg-slate-200" /><div className="space-y-4 p-5"><div className="h-6 w-1/2 rounded bg-slate-200" /><div className="h-4 w-3/4 rounded bg-slate-100" /><div className="grid grid-cols-3 gap-3"><div className="h-14 rounded-xl bg-slate-100" /><div className="h-14 rounded-xl bg-slate-100" /><div className="h-14 rounded-xl bg-slate-100" /></div><div className="h-10 rounded-xl bg-slate-100" /></div></div>;
}

function EmptyState({ hasBookings }: { hasBookings: boolean }) {
  return <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"><CalendarDays className="h-9 w-9 text-primary" /></div><h3 className="mt-5 text-xl font-black text-slate-900">{hasBookings ? "Không có booking phù hợp" : "Bạn chưa có chuyến đi nào"}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{hasBookings ? "Thử thay đổi từ khóa hoặc bộ lọc trạng thái." : "Tìm một chỗ nghỉ phù hợp và bắt đầu hành trình tiếp theo của bạn."}</p>{!hasBookings && <Button asChild className="mt-6 rounded-xl font-bold text-white"><Link to="/search"><Search className="mr-2 h-4 w-4" />Tìm chỗ nghỉ</Link></Button>}</div>;
}

function canCancel(booking: Booking) {
  return booking.status === "PENDING" || booking.status === "CONFIRMED";
}

function getNights(booking: Booking) {
  return Math.max(1, Math.round((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value));
}

function compactCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu ₫`;
  return formatCurrency(value);
}

function paymentMethodLabel(method: Booking["paymentMethod"]) {
  if (method === "VNPAY") return "Thanh toán qua VNPay";
  if (method === "PAY_AT_HOTEL") return "Thanh toán tại chỗ nghỉ";
  return method || "Chưa xác định phương thức";
}
