import { useEffect, useState } from "react";
import {
  Banknote,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Hotel,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Booking, BookingStatus, PaymentStatus } from "@/types";
import { toast } from "sonner";

const statusConfig: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  CONFIRMED: { label: "Đã xác nhận", className: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  CANCELLED: { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  COMPLETED: { label: "Hoàn thành", className: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Chưa thanh toán", className: "border-amber-200 bg-amber-50 text-amber-700" },
  PAID: { label: "Đã thanh toán", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  REFUNDED: { label: "Đã hoàn tiền", className: "border-violet-200 bg-violet-50 text-violet-700" },
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusAction, setStatusAction] = useState<{ booking: Booking; status: BookingStatus } | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBookings(); }, []);

  const updateStatus = async () => {
    if (!statusAction) return;
    setUpdating(statusAction.booking.id);
    try {
      const response = await bookingService.updateBookingStatus(statusAction.booking.id, statusAction.status);
      const updated = { ...statusAction.booking, ...response.data };
      setBookings((current) => current.map((booking) => booking.id === updated.id ? updated : booking));
      setSelectedBooking((current) => current?.id === updated.id ? { ...current, ...response.data } : current);
      toast.success(getActionCopy(statusAction.status).success(statusAction.booking.bookingCode));
      setStatusAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái đặt phòng");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings
    .filter((booking) => {
      const keyword = search.trim().toLowerCase();
      const searchable = `${booking.bookingCode} ${booking.guestName} ${booking.guestEmail} ${booking.guestPhone} ${booking.hotel?.name || ""} ${booking.roomType?.name || ""} ${booking.transactionId || ""}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (status === "ALL" || booking.status === status)
        && (paymentStatus === "ALL" || booking.paymentStatus === paymentStatus);
    })
    .sort((left, right) => {
      if (left.status === "PENDING" && right.status !== "PENDING") return -1;
      if (left.status !== "PENDING" && right.status === "PENDING") return 1;
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const activeStays = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const paidRevenue = bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const paymentRate = bookings.length ? Math.round(bookings.filter((booking) => booking.paymentStatus === "PAID").length / bookings.length * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30 md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950 dark:text-blue-300"><ShieldCheck className="h-4 w-4" />Booking operations</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý đặt phòng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Theo dõi toàn bộ hành trình đặt phòng, tình trạng lưu trú và thanh toán trên hệ thống NestBooking.</p>
          </div>
          <Button variant="outline" onClick={() => void loadBookings()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới dữ liệu</Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Tổng đặt phòng" value={bookings.length.toLocaleString("vi-VN")} hint="Toàn bộ đơn trên hệ thống" tone="blue" />
        <StatCard icon={Clock3} label="Chờ xác nhận" value={pendingBookings.toLocaleString("vi-VN")} hint="Cần được xử lý sớm" tone="amber" />
        <StatCard icon={CalendarCheck2} label="Sắp lưu trú" value={activeStays.toLocaleString("vi-VN")} hint="Booking đã xác nhận" tone="indigo" />
        <StatCard icon={Banknote} label="Doanh thu đã thu" value={compactCurrency(paidRevenue)} hint={`${paymentRate}% booking đã thanh toán`} tone="emerald" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm mã booking, khách, chỗ nghỉ hoặc giao dịch" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus | "ALL")}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả thanh toán</SelectItem><SelectItem value="UNPAID">Chưa thanh toán</SelectItem><SelectItem value="PAID">Đã thanh toán</SelectItem><SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem></SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="PENDING">Chờ xác nhận</SelectItem><SelectItem value="CONFIRMED">Đã xác nhận</SelectItem><SelectItem value="COMPLETED">Hoàn thành</SelectItem><SelectItem value="CANCELLED">Đã hủy</SelectItem></SelectContent>
              </Select>
              <div className="hidden whitespace-nowrap text-sm text-muted-foreground 2xl:block">{filtered.length} kết quả</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1320px]">
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="w-[150px] pl-5">Booking</TableHead><TableHead className="w-[220px]">Khách lưu trú</TableHead><TableHead className="w-[220px]">Chỗ nghỉ</TableHead><TableHead className="w-[165px]">Thời gian</TableHead><TableHead className="w-[190px]">Thanh toán</TableHead><TableHead className="w-[145px]">Trạng thái</TableHead><TableHead className="w-[300px] pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {!loading && filtered.length ? filtered.map((booking) => (
                  <TableRow key={booking.id} className={booking.status === "PENDING" ? "bg-amber-50/35 hover:bg-amber-50/60 dark:bg-amber-950/10" : "hover:bg-blue-50/30 dark:hover:bg-zinc-900"}>
                    <TableCell className="pl-5"><div><div className="font-bold text-blue-700 dark:text-blue-400">{booking.bookingCode}</div><div className="mt-1 text-xs text-slate-400">{booking.createdAt ? `Tạo ${formatDate(booking.createdAt)}` : `ID: ${booking.id.slice(0, 8).toUpperCase()}`}</div></div></TableCell>
                    <TableCell><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 font-bold text-white">{booking.guestName.charAt(0).toUpperCase()}</div><div className="min-w-0"><div className="max-w-48 truncate font-semibold text-slate-800 dark:text-zinc-100">{booking.guestName}</div><div className="mt-0.5 max-w-48 truncate text-xs text-muted-foreground">{booking.guestEmail}</div><div className="text-xs text-muted-foreground">{booking.guestPhone}</div></div></div></TableCell>
                    <TableCell><div className="flex max-w-56 items-start gap-2"><Hotel className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><div className="truncate font-medium text-slate-700 dark:text-zinc-200">{booking.hotel?.name || booking.hotelId.slice(0, 8)}</div><div className="mt-1 truncate text-xs text-muted-foreground">{booking.roomType?.name || booking.roomTypeId.slice(0, 8)} · {booking.quantity} phòng</div></div></div></TableCell>
                    <TableCell><StayDates booking={booking} /></TableCell>
                    <TableCell className="py-3"><div className="flex min-w-[170px] flex-col items-start gap-1.5"><div className="whitespace-nowrap font-semibold text-slate-800 dark:text-zinc-100">{formatCurrency(booking.totalAmount)}</div><PaymentBadge status={booking.paymentStatus} /><div className="whitespace-nowrap text-xs text-muted-foreground">{paymentMethodLabel(booking.paymentMethod)}</div></div></TableCell>
                    <TableCell className="py-3 align-middle"><div className="flex min-w-[125px] items-center"><BookingBadge status={booking.status} /></div></TableCell>
                    <TableCell className="pr-5"><BookingActions booking={booking} updating={updating} onView={setSelectedBooking} onAction={(nextStatus) => setStatusAction({ booking, status: nextStatus })} /></TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={7} className="h-44 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải danh sách đặt phòng...</span> : <span><CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />Không có đặt phòng phù hợp với bộ lọc.</span>}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl p-0">
          {selectedBooking && <><div className="bg-gradient-to-r from-[#062a5e] via-[#0b5fa5] to-[#2563eb] p-6 text-white"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Booking detail</div><DialogTitle className="text-2xl text-white">{selectedBooking.bookingCode}</DialogTitle><DialogDescription className="mt-1 text-blue-100">Tạo lúc {selectedBooking.createdAt ? formatDateTime(selectedBooking.createdAt) : "không xác định"}</DialogDescription></div><div className="flex flex-wrap gap-2"><BookingBadge status={selectedBooking.status} /><PaymentBadge status={selectedBooking.paymentStatus} /></div></div></div><div className="space-y-6 p-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard icon={UserRound} label="Khách lưu trú" value={selectedBooking.guestName} /><SummaryCard icon={Hotel} label="Chỗ nghỉ" value={selectedBooking.hotel?.name || selectedBooking.hotelId} /><SummaryCard icon={BedDouble} label="Phòng" value={`${selectedBooking.roomType?.name || selectedBooking.roomTypeId} · ${selectedBooking.quantity} phòng`} /><SummaryCard icon={Banknote} label="Tổng tiền" value={formatCurrency(selectedBooking.totalAmount)} /></div><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-950 dark:bg-blue-950/20"><div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><CalendarCheck2 className="h-5 w-5 text-blue-600" />Lịch trình lưu trú</div><div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]"><DateBlock label="Nhận phòng" value={formatDate(selectedBooking.checkInDate)} /><div className="hidden items-center text-sm font-medium text-blue-600 sm:flex">{getNights(selectedBooking)} đêm</div><DateBlock label="Trả phòng" value={formatDate(selectedBooking.checkOutDate)} align="right" /></div></div><div className="grid gap-4 sm:grid-cols-2"><InfoSection title="Thông tin liên hệ" items={[{ icon: Phone, value: selectedBooking.guestPhone }, { icon: Mail, value: selectedBooking.guestEmail }]} /><InfoSection title="Thông tin thanh toán" items={[{ icon: WalletCards, value: paymentMethodLabel(selectedBooking.paymentMethod) }, { icon: CreditCard, value: selectedBooking.transactionId || "Chưa có mã giao dịch" }, { icon: CalendarDays, value: selectedBooking.paymentDate ? `Thanh toán ${formatDateTime(selectedBooking.paymentDate)}` : "Chưa ghi nhận ngày thanh toán" }]} /></div>{selectedBooking.specialRequests && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-950 dark:bg-amber-950/20"><div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Yêu cầu đặc biệt</div><p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{selectedBooking.specialRequests}</p></div>}<div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5 dark:border-zinc-800"><ModalActions booking={selectedBooking} updating={updating} onAction={(nextStatus) => setStatusAction({ booking: selectedBooking, status: nextStatus })} /></div></div></>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open && !updating) setStatusAction(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          {statusAction && <><DialogHeader><div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${getActionCopy(statusAction.status).iconClass}`}>{getActionIcon(statusAction.status)}</div><DialogTitle>{getActionCopy(statusAction.status).title}</DialogTitle><DialogDescription>{getActionCopy(statusAction.status).description(statusAction.booking.bookingCode)}</DialogDescription></DialogHeader><DialogFooter className="mt-3 gap-2"><Button variant="outline" onClick={() => setStatusAction(null)} disabled={Boolean(updating)}>Quay lại</Button><Button variant={statusAction.status === "CANCELLED" ? "destructive" : "default"} onClick={() => void updateStatus()} disabled={Boolean(updating)}>{updating ? "Đang cập nhật..." : getActionCopy(statusAction.status).confirm}</Button></DialogFooter></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingActions({ booking, updating, onView, onAction }: { booking: Booking; updating: string | null; onView: (booking: Booking) => void; onAction: (status: BookingStatus) => void }) {
  return <div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg" onClick={() => onView(booking)}><Eye className="h-3.5 w-3.5" />Chi tiết</Button>{booking.status === "PENDING" && <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={updating === booking.id} onClick={() => onAction("CONFIRMED")}><CheckCircle2 className="h-3.5 w-3.5" />Xác nhận</Button>}{booking.status === "CONFIRMED" && <Button size="sm" className="h-8 gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700" disabled={updating === booking.id} onClick={() => onAction("COMPLETED")}><CalendarCheck2 className="h-3.5 w-3.5" />Hoàn thành</Button>}{["PENDING", "CONFIRMED"].includes(booking.status) && <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" disabled={updating === booking.id} onClick={() => onAction("CANCELLED")}><XCircle className="h-3.5 w-3.5" />Hủy</Button>}</div>;
}

function ModalActions({ booking, updating, onAction }: { booking: Booking; updating: string | null; onAction: (status: BookingStatus) => void }) {
  if (["CANCELLED", "COMPLETED"].includes(booking.status)) return <span className="text-sm text-muted-foreground">Booking đã kết thúc, không còn thao tác.</span>;
  return <>{booking.status === "PENDING" && <Button disabled={updating === booking.id} onClick={() => onAction("CONFIRMED")}><CheckCircle2 className="mr-2 h-4 w-4" />Xác nhận booking</Button>}{booking.status === "CONFIRMED" && <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={updating === booking.id} onClick={() => onAction("COMPLETED")}><CalendarCheck2 className="mr-2 h-4 w-4" />Đánh dấu hoàn thành</Button>}<Button variant="destructive" disabled={updating === booking.id} onClick={() => onAction("CANCELLED")}><XCircle className="mr-2 h-4 w-4" />Hủy booking</Button></>;
}

function BookingBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  return <Badge variant="outline" className={`shrink-0 whitespace-nowrap px-2.5 py-1 ${config.className}`}><span className={`mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />{config.label}</Badge>;
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status];
  return <Badge variant="outline" className={`shrink-0 whitespace-nowrap px-2.5 py-1 ${config.className}`}>{config.label}</Badge>;
}

function StayDates({ booking }: { booking: Booking }) {
  return <div className="min-w-36"><div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-200"><span className="h-2 w-2 rounded-full bg-blue-500" />{formatDate(booking.checkInDate)}</div><div className="ml-[3px] h-3 border-l border-dashed border-slate-300" /><div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full border-2 border-slate-400 bg-white dark:bg-zinc-900" />{formatDate(booking.checkOutDate)}</div><div className="mt-1 text-xs text-muted-foreground">{getNights(booking)} đêm</div></div>;
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof CalendarDays; label: string; value: string; hint: string; tone: "blue" | "amber" | "indigo" | "emerald" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", indigo: "bg-indigo-50 text-indigo-700", emerald: "bg-emerald-50 text-emerald-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 truncate text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900"><Icon className="mb-2 h-4 w-4 text-blue-600" /><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 line-clamp-2 text-sm font-medium text-slate-800 dark:text-zinc-100">{value}</div></div>;
}

function DateBlock({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) {
  return <div className={align === "right" ? "sm:text-right" : ""}><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</div></div>;
}

function InfoSection({ title, items }: { title: string; items: { icon: typeof Phone; value: string }[] }) {
  return <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"><h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{title}</h3><div className="space-y-2.5">{items.map(({ icon: Icon, value }, index) => <div key={`${value}-${index}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span className="break-all">{value}</span></div>)}</div></div>;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatCurrency(value: number) {
  return currencyFormatter.format(Number(value));
}

function compactCurrency(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu ₫`;
  return currencyFormatter.format(value);
}

function getNights(booking: Booking) {
  return Math.max(1, Math.round((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000));
}

function paymentMethodLabel(method: Booking["paymentMethod"]) {
  const labels: Record<string, string> = { VNPAY: "VNPay", PAY_AT_HOTEL: "Thanh toán tại chỗ nghỉ", MOMO: "MoMo", ZALOPAY: "ZaloPay", CREDIT_CARD: "Thẻ tín dụng" };
  return method ? labels[method] || method : "Chưa xác định";
}

function getActionIcon(status: BookingStatus) {
  if (status === "CANCELLED") return <XCircle className="h-6 w-6" />;
  if (status === "COMPLETED") return <CalendarCheck2 className="h-6 w-6" />;
  return <CheckCircle2 className="h-6 w-6" />;
}

function getActionCopy(status: BookingStatus) {
  if (status === "CANCELLED") return { title: "Hủy đặt phòng?", confirm: "Xác nhận hủy", iconClass: "bg-red-100 text-red-600", success: (code: string) => `Đã hủy booking ${code}`, description: (code: string) => `Booking ${code} sẽ bị hủy và không thể chuyển sang trạng thái khác sau thao tác này.` };
  if (status === "COMPLETED") return { title: "Hoàn thành đặt phòng?", confirm: "Xác nhận hoàn thành", iconClass: "bg-emerald-100 text-emerald-600", success: (code: string) => `Đã hoàn thành booking ${code}`, description: (code: string) => `Xác nhận khách của booking ${code} đã hoàn tất kỳ lưu trú.` };
  return { title: "Xác nhận đặt phòng?", confirm: "Xác nhận booking", iconClass: "bg-blue-100 text-blue-600", success: (code: string) => `Đã xác nhận booking ${code}`, description: (code: string) => `Booking ${code} sẽ chuyển sang trạng thái đã xác nhận và sẵn sàng phục vụ.` };
}
