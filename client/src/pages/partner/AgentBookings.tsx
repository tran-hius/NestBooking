import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BedDouble,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { bookingService } from "@/api/services/bookingService";
import { hotelService } from "@/api/services/hotelService";
import { roomService } from "@/api/services/roomService";
import api from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Booking, BookingStatus, Hotel, PaymentStatus, Room } from "@/types";
import { toast } from "sonner";

const statusConfig: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300", dot: "bg-amber-500" },
  CONFIRMED: { label: "Đã xác nhận", className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300", dot: "bg-blue-500" },
  CHECKED_IN: { label: "Đang lưu trú", className: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300", dot: "bg-indigo-500" },
  CANCELLED: { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300", dot: "bg-red-500" },
  COMPLETED: { label: "Hoàn thành", className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-cyan-300", dot: "bg-sky-500" },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Chưa thanh toán", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" },
  PAID: { label: "Đã thanh toán", className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-cyan-300" },
  REFUNDED: { label: "Đã hoàn tiền", className: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300" },
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function AgentBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelId, setHotelId] = useState(searchParams.get("hotelId") || "ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusAction, setStatusAction] = useState<{ booking: Booking; status: BookingStatus } | null>(null);
  
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [qrPaymentUrl, setQrPaymentUrl] = useState<string | null>(null);
  const [generatingQr, setGeneratingQr] = useState<string | null>(null);

  useEffect(() => {
    if (statusAction?.status === "CHECKED_IN") {
      setLoadingRooms(true);
      roomService.getByRoomType(statusAction.booking.roomTypeId)
        .then((res) => {
          const available = res.data.filter(r => r.status === "AVAILABLE" && r.isActive);
          setAvailableRooms(available);
          setSelectedRoomIds(available.slice(0, statusAction.booking.quantity).map(r => r.id));
        })
        .catch(() => toast.error("Không thể tải danh sách phòng trống"))
        .finally(() => setLoadingRooms(false));
    } else {
      setAvailableRooms([]);
      setSelectedRoomIds([]);
    }
  }, [statusAction]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const hotelResponse = await hotelService.getMyHotels();
      const hotelList = hotelResponse.data.data;
      setHotels(hotelList);
      const responses = await Promise.allSettled(hotelList.map((hotel) => bookingService.getHotelBookings(hotel.id)));
      const bookingList = responses.flatMap((response) => response.status === "fulfilled" ? response.value.data : []);
      setBookings(bookingList);
      if (responses.some((response) => response.status === "rejected")) toast.warning("Một phần dữ liệu booking chưa tải được");
      setHotelId((current) => current !== "ALL" && hotelList.some((hotel) => hotel.id === current) ? current : "ALL");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch đặt phòng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const changeHotel = (value: string) => {
    setHotelId(value);
    if (value === "ALL") setSearchParams({}, { replace: true });
    else setSearchParams({ hotelId: value }, { replace: true });
  };

  const handleGenerateQr = async (booking: Booking) => {
    try {
      setGeneratingQr(booking.id);
      const res = await api.get(`/api/payments/generate_url/${booking.id}`);
      setQrPaymentUrl(res.data.paymentUrl);
    } catch (error) {
      toast.error("Không thể tạo mã QR thanh toán");
    } finally {
      setGeneratingQr(null);
    }
  };

  const updateStatus = async () => {
    if (!statusAction) return;
    
    if (statusAction.status === "CHECKED_IN" && selectedRoomIds.length !== statusAction.booking.quantity) {
      toast.error(`Vui lòng chọn đủ ${statusAction.booking.quantity} phòng để nhận phòng.`);
      return;
    }

    setUpdating(statusAction.booking.id);
    try {
      const response = await bookingService.updateBookingStatus(
        statusAction.booking.id, 
        statusAction.status,
        statusAction.status === "CHECKED_IN" ? selectedRoomIds : undefined
      );
      const updated = { ...statusAction.booking, ...response.data };
      setBookings((current) => current.map((booking) => booking.id === updated.id ? updated : booking));
      setSelectedBooking((current) => current?.id === updated.id ? { ...current, ...response.data } : current);
      toast.success(getActionCopy(statusAction.status).success(statusAction.booking.bookingCode));
      setStatusAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái booking");
    } finally {
      setUpdating(null);
    }
  };

  const updatePayment = async (booking: Booking, newStatus: PaymentStatus) => {
    setUpdating(booking.id);
    try {
      const response = await bookingService.updatePaymentStatus(booking.id, newStatus);
      const updated = { ...booking, ...response.data };
      setBookings((current) => current.map((b) => b.id === updated.id ? updated : b));
      setSelectedBooking((current) => current?.id === updated.id ? { ...current, ...response.data } : current);
      toast.success("Đã cập nhật trạng thái thanh toán!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái thanh toán");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings
    .filter((booking) => {
      const keyword = search.trim().toLowerCase();
      const searchable = `${booking.bookingCode} ${booking.guestName} ${booking.guestEmail} ${booking.guestPhone} ${booking.roomType?.name || ""} ${booking.transactionId || ""}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (hotelId === "ALL" || booking.hotelId === hotelId)
        && (status === "ALL" || booking.status === status)
        && (paymentStatus === "ALL" || booking.paymentStatus === paymentStatus);
    })
    .sort((left, right) => {
      if (left.status === "PENDING" && right.status !== "PENDING") return -1;
      if (left.status !== "PENDING" && right.status === "PENDING") return 1;
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

  const scopedBookings = bookings.filter((booking) => hotelId === "ALL" || booking.hotelId === hotelId);
  const pendingBookings = scopedBookings.filter((booking) => booking.status === "PENDING").length;
  const confirmedBookings = scopedBookings.filter((booking) => booking.status === "CONFIRMED").length;
  const paidRevenue = scopedBookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const paymentRate = scopedBookings.length ? Math.round(scopedBookings.filter((booking) => booking.paymentStatus === "PAID").length / scopedBookings.length * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/50 to-sky-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30 md:p-7">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950 dark:text-blue-300"><CalendarCheck2 className="h-4 w-4" />Booking operations</div><h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý đặt phòng</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Theo dõi yêu cầu đặt phòng, kỳ lưu trú và thanh toán tại toàn bộ chỗ nghỉ của bạn.</p></div><Button variant="outline" onClick={() => void loadData()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới dữ liệu</Button></div>
      </section>

      {!hotels.length && !loading ? <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex flex-col items-center px-6 py-16 text-center"><Building2 className="h-12 w-12 text-slate-300" /><h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Chưa có chỗ nghỉ để nhận booking</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Tạo và hoàn thiện chỗ nghỉ đầu tiên trước khi quản lý lịch đặt phòng.</p><Button asChild className="mt-5"><Link to="/partner/property-type">Tạo chỗ nghỉ</Link></Button></CardContent></Card> : <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={CalendarDays} label="Tổng booking" value={scopedBookings.length.toLocaleString("vi-VN")} hint={hotelId === "ALL" ? "Tại tất cả chỗ nghỉ" : "Tại chỗ nghỉ đang chọn"} tone="blue" /><StatCard icon={Clock3} label="Chờ xác nhận" value={pendingBookings.toLocaleString("vi-VN")} hint={pendingBookings ? "Cần được xử lý sớm" : "Không có booking tồn đọng"} tone="amber" /><StatCard icon={CalendarCheck2} label="Đã xác nhận" value={confirmedBookings.toLocaleString("vi-VN")} hint="Booking sẵn sàng phục vụ" tone="indigo" /><StatCard icon={Banknote} label="Doanh thu đã thu" value={compactCurrency(paidRevenue)} hint={`${paymentRate}% booking đã thanh toán`} tone="sky" /></div>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="p-0"><div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_240px_190px_190px_auto] md:p-5 dark:border-zinc-800"><div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm mã booking, khách hoặc giao dịch" /></div><Select value={hotelId} onValueChange={changeHotel}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả chỗ nghỉ</SelectItem>{hotels.map((hotel) => <SelectItem key={hotel.id} value={hotel.id}>{hotel.name} · {hotel.city}</SelectItem>)}</SelectContent></Select><Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus | "ALL")}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả thanh toán</SelectItem><SelectItem value="UNPAID">Chưa thanh toán</SelectItem><SelectItem value="PAID">Đã thanh toán</SelectItem><SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem></SelectContent></Select><Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="PENDING">Chờ xác nhận</SelectItem><SelectItem value="CONFIRMED">Đã xác nhận</SelectItem><SelectItem value="CHECKED_IN">Đang lưu trú</SelectItem><SelectItem value="COMPLETED">Hoàn thành</SelectItem><SelectItem value="CANCELLED">Đã hủy</SelectItem></SelectContent></Select><div className="hidden self-center whitespace-nowrap text-sm text-muted-foreground xl:block">{filtered.length} kết quả</div></div>

          <div className="overflow-x-auto"><Table className="min-w-[1320px]"><TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="w-[150px] pl-5">Booking</TableHead><TableHead className="w-[220px]">Khách lưu trú</TableHead><TableHead className="w-[220px]">Chỗ nghỉ</TableHead><TableHead className="w-[165px]">Thời gian</TableHead><TableHead className="w-[190px]">Thanh toán</TableHead><TableHead className="w-[145px]">Trạng thái</TableHead><TableHead className="w-[300px] pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{!loading && filtered.length ? filtered.map((booking) => <TableRow key={booking.id} className={booking.status === "PENDING" ? "bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-950/10" : "hover:bg-blue-50/25 dark:hover:bg-zinc-900"}><TableCell className="pl-5"><div className="font-bold text-blue-700 dark:text-blue-400">{booking.bookingCode}</div><div className="mt-1 text-xs text-slate-400">{booking.createdAt ? `Tạo ${formatDate(booking.createdAt)}` : `ID: ${booking.id.slice(0, 8).toUpperCase()}`}</div></TableCell><TableCell><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">{booking.guestName.charAt(0).toUpperCase()}</div><div className="min-w-0"><div className="max-w-48 truncate font-semibold text-slate-800 dark:text-zinc-100">{booking.guestName}</div><div className="mt-0.5 max-w-48 truncate text-xs text-muted-foreground">{booking.guestEmail}</div><div className="text-xs text-muted-foreground">{booking.guestPhone}</div></div></div></TableCell><TableCell><div className="flex max-w-56 items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><div className="truncate font-medium text-slate-700 dark:text-zinc-200">{booking.hotel?.name || hotelName(hotels, booking.hotelId)}</div><div className="mt-1 truncate text-xs text-muted-foreground">{booking.roomType?.name || booking.roomTypeId.slice(0, 8)} · {booking.quantity} phòng</div></div></div></TableCell><TableCell><StayDates booking={booking} /></TableCell><TableCell><div className="flex min-w-[170px] flex-col items-start gap-1.5"><div className="whitespace-nowrap font-semibold">{formatCurrency(booking.totalAmount)}</div><PaymentBadge status={booking.paymentStatus} /><div className="whitespace-nowrap text-xs text-muted-foreground">{paymentMethodLabel(booking.paymentMethod)}</div></div></TableCell><TableCell><BookingBadge status={booking.status} /></TableCell><TableCell className="pr-5"><BookingActions booking={booking} updating={updating} generatingQr={generatingQr} onView={setSelectedBooking} onAction={(nextStatus) => setStatusAction({ booking, status: nextStatus })} onPaymentAction={(nextPayment) => void updatePayment(booking, nextPayment)} onGenerateQr={handleGenerateQr} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="h-48 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải lịch đặt phòng...</span> : <span><CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />Không có booking phù hợp với bộ lọc.</span>}</TableCell></TableRow>}</TableBody></Table></div>
        </CardContent></Card>
      </>}

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl p-0">{selectedBooking && <><div className="bg-gradient-to-r from-[#031b3d] via-[#051f46] to-[#0a3977] p-6 text-white"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">Booking detail</div><DialogTitle className="text-2xl text-white">{selectedBooking.bookingCode}</DialogTitle><DialogDescription className="mt-1 text-cyan-50/80">Tạo lúc {selectedBooking.createdAt ? formatDateTime(selectedBooking.createdAt) : "không xác định"}</DialogDescription></div><div className="flex flex-wrap gap-2"><BookingBadge status={selectedBooking.status} /><PaymentBadge status={selectedBooking.paymentStatus} /></div></div></div><div className="space-y-5 p-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard icon={UserRound} label="Khách lưu trú" value={selectedBooking.guestName} /><SummaryCard icon={Building2} label="Chỗ nghỉ" value={selectedBooking.hotel?.name || hotelName(hotels, selectedBooking.hotelId)} /><SummaryCard icon={BedDouble} label="Phòng" value={`${selectedBooking.roomType?.name || selectedBooking.roomTypeId} · ${selectedBooking.quantity} phòng`} /><SummaryCard icon={Banknote} label="Tổng tiền" value={formatCurrency(selectedBooking.totalAmount)} /></div><div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 dark:border-sky-950 dark:bg-sky-950/20"><div className="mb-4 flex items-center gap-2 font-semibold"><CalendarCheck2 className="h-5 w-5 text-sky-600" />Lịch trình lưu trú</div><div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]"><DateBlock label="Nhận phòng" value={formatDate(selectedBooking.checkInDate)} /><div className="hidden items-center text-sm font-medium text-sky-700 sm:flex">{getNights(selectedBooking)} đêm</div><DateBlock label="Trả phòng" value={formatDate(selectedBooking.checkOutDate)} align="right" /></div></div><div className="grid gap-4 sm:grid-cols-2"><InfoSection title="Thông tin liên hệ" items={[{ icon: Phone, value: selectedBooking.guestPhone }, { icon: Mail, value: selectedBooking.guestEmail }]} /><InfoSection title="Thanh toán" items={[{ icon: Banknote, value: formatCurrency(selectedBooking.totalAmount) }, { icon: CheckCircle2, value: `${paymentConfig[selectedBooking.paymentStatus].label} · ${paymentMethodLabel(selectedBooking.paymentMethod)}` }]} /></div>{selectedBooking.specialRequests && <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Yêu cầu đặc biệt</div><p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{selectedBooking.specialRequests}</p></div>}<DialogFooter><ModalActions booking={selectedBooking} updating={updating} generatingQr={generatingQr} onAction={(nextStatus) => setStatusAction({ booking: selectedBooking, status: nextStatus })} onPaymentAction={(nextPayment) => void updatePayment(selectedBooking, nextPayment)} onGenerateQr={handleGenerateQr} /></DialogFooter></div></>}</DialogContent></Dialog>

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open && !updating) setStatusAction(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          {statusAction && (
            <>
              <DialogHeader>
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${getActionCopy(statusAction.status).iconClass}`}>
                  {getActionIcon(statusAction.status)}
                </div>
                <DialogTitle>{getActionCopy(statusAction.status).title}</DialogTitle>
                <DialogDescription>
                  {getActionCopy(statusAction.status).description(statusAction.booking.bookingCode)}
                </DialogDescription>
              </DialogHeader>
              
              {statusAction.status === "CHECKED_IN" && (
                <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                  <div className="mb-3 text-sm font-medium text-indigo-900 dark:text-indigo-200">
                    Hệ thống đã tự động xếp {statusAction.booking.quantity} phòng cho khách:
                  </div>
                  {loadingRooms ? (
                    <div className="flex items-center gap-2 text-sm text-indigo-500"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải danh sách phòng...</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {availableRooms.filter(r => selectedRoomIds.includes(r.id)).map((room) => {
                        return (
                          <div
                            key={room.id}
                            className="flex items-center justify-center rounded-lg border p-2 text-sm font-semibold transition-colors bg-indigo-600 text-white border-indigo-600"
                          >
                            {room.roomNumber}
                          </div>
                        );
                      })}
                      {availableRooms.length < statusAction.booking.quantity && (
                        <div className="col-span-full text-sm font-medium text-red-500">
                          Không đủ số lượng phòng trống! Hệ thống chỉ tìm thấy {availableRooms.length}/{statusAction.booking.quantity} phòng.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="mt-3 gap-2">
                <Button variant="outline" onClick={() => setStatusAction(null)} disabled={Boolean(updating)}>Quay lại</Button>
                <Button 
                  variant={statusAction.status === "CANCELLED" ? "destructive" : "default"} 
                  onClick={() => void updateStatus()} 
                  disabled={Boolean(updating) || (statusAction.status === "CHECKED_IN" && selectedRoomIds.length !== statusAction.booking.quantity)}
                >
                  {updating ? "Đang cập nhật..." : getActionCopy(statusAction.status).confirm}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(qrPaymentUrl)} onOpenChange={(open) => { if (!open) setQrPaymentUrl(null); }}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle>Thanh toán trực tuyến</DialogTitle>
            <DialogDescription>
              Quét mã QR dưới đây bằng ứng dụng ngân hàng hoặc ví điện tử (VNPAY) để thanh toán.
            </DialogDescription>
          </DialogHeader>
          {qrPaymentUrl && (
            <div className="flex flex-col items-center justify-center p-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPaymentUrl)}`} alt="QR Code" className="h-48 w-48 rounded-lg border p-2 shadow-sm" />
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => window.open(qrPaymentUrl, "_blank")}
              >
                Mở link thanh toán
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingActions({ booking, updating, generatingQr, onView, onAction, onPaymentAction, onGenerateQr }: { booking: Booking; updating: string | null; generatingQr: string | null; onView: (booking: Booking) => void; onAction: (status: BookingStatus) => void; onPaymentAction: (status: PaymentStatus) => void; onGenerateQr: (booking: Booking) => void; }) {
  return (
    <div className="flex justify-end gap-2">
      {booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED" && booking.paymentMethod === "PAY_AT_HOTEL" && (
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-sky-200 text-sky-600 hover:bg-sky-50" disabled={updating === booking.id} onClick={() => onPaymentAction("PAID")}>
          <Banknote className="h-3.5 w-3.5" />Thu tiền
        </Button>
      )}
      {booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED" && booking.paymentMethod === "VNPAY" && (
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50" disabled={generatingQr === booking.id || updating === booking.id} onClick={() => onGenerateQr(booking)}>
          {generatingQr === booking.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />} Thanh toán online
        </Button>
      )}
      <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg" onClick={() => onView(booking)}>
        <Eye className="h-3.5 w-3.5" />Chi tiết
      </Button>
      {booking.status === "PENDING" && (
        <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={updating === booking.id} onClick={() => onAction("CONFIRMED")}>
          <CheckCircle2 className="h-3.5 w-3.5" />Xác nhận
        </Button>
      )}
      {booking.status === "CONFIRMED" && booking.paymentStatus === "PAID" && (
        <Button size="sm" className="h-8 gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700" disabled={updating === booking.id} onClick={() => onAction("CHECKED_IN")}>
          <Clock3 className="h-3.5 w-3.5" />Nhận phòng
        </Button>
      )}
      {booking.status === "CHECKED_IN" && (
        <Button size="sm" className="h-8 gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700" disabled={updating === booking.id} onClick={() => onAction("COMPLETED")}>
          <CalendarCheck2 className="h-3.5 w-3.5" />Trả phòng
        </Button>
      )}
      {["PENDING", "CONFIRMED"].includes(booking.status) && (
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" disabled={updating === booking.id} onClick={() => onAction("CANCELLED")}>
          <XCircle className="h-3.5 w-3.5" />Hủy
        </Button>
      )}
    </div>
  );
}

function ModalActions({ booking, updating, generatingQr, onAction, onPaymentAction, onGenerateQr }: { booking: Booking; updating: string | null; generatingQr: string | null; onAction: (status: BookingStatus) => void; onPaymentAction?: (status: PaymentStatus) => void; onGenerateQr?: (booking: Booking) => void; }) {
  return (
    <>
      {booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED" && booking.paymentMethod === "PAY_AT_HOTEL" && onPaymentAction && <Button variant="outline" className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/50" disabled={updating === booking.id} onClick={() => onPaymentAction("PAID")}><Banknote className="mr-2 h-4 w-4" />Đã thu tiền</Button>}
      {booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED" && booking.paymentMethod === "VNPAY" && onGenerateQr && <Button variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50" disabled={generatingQr === booking.id || updating === booking.id} onClick={() => onGenerateQr(booking)}>{generatingQr === booking.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />} Thanh toán online</Button>}
      {booking.status === "PENDING" && <Button disabled={updating === booking.id} onClick={() => onAction("CONFIRMED")}><CheckCircle2 className="mr-2 h-4 w-4" />Xác nhận booking</Button>}
      {booking.status === "CONFIRMED" && booking.paymentStatus === "PAID" && <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={updating === booking.id} onClick={() => onAction("CHECKED_IN")}><Clock3 className="mr-2 h-4 w-4" />Khách nhận phòng</Button>}
      {booking.status === "CHECKED_IN" && <Button className="bg-sky-600 hover:bg-sky-700" disabled={updating === booking.id} onClick={() => onAction("COMPLETED")}><CalendarCheck2 className="mr-2 h-4 w-4" />Khách trả phòng</Button>}
      {["PENDING", "CONFIRMED"].includes(booking.status) && <Button variant="destructive" disabled={updating === booking.id} onClick={() => onAction("CANCELLED")}><XCircle className="mr-2 h-4 w-4" />Hủy booking</Button>}
    </>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: LucideIcon; label: string; value: string; hint: string; tone: "blue" | "amber" | "indigo" | "sky" }) {
  const tones = { blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300", sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-cyan-300" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 truncate text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function BookingBadge({ status }: { status: BookingStatus }) { const config = statusConfig[status]; return <Badge variant="outline" className={`shrink-0 whitespace-nowrap px-2.5 py-1 ${config.className}`}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dot}`} />{config.label}</Badge>; }
function PaymentBadge({ status }: { status: PaymentStatus }) { const config = paymentConfig[status]; return <Badge variant="outline" className={`shrink-0 whitespace-nowrap px-2.5 py-1 ${config.className}`}>{config.label}</Badge>; }
function StayDates({ booking }: { booking: Booking }) { return <div className="min-w-36"><div className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-sky-500" />{formatDate(booking.checkInDate)}</div><div className="ml-[3px] h-3 border-l border-dashed border-slate-300" /><div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full border-2 border-slate-400 bg-white dark:bg-zinc-900" />{formatDate(booking.checkOutDate)}</div><div className="mt-1 text-xs text-muted-foreground">{getNights(booking)} đêm</div></div>; }
function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900"><Icon className="mb-2 h-4 w-4 text-sky-600" /><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 line-clamp-2 text-sm font-medium">{value}</div></div>; }
function DateBlock({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) { return <div className={align === "right" ? "sm:text-right" : ""}><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-lg font-bold">{value}</div></div>; }
function InfoSection({ title, items }: { title: string; items: { icon: LucideIcon; value: string }[] }) { return <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"><h3 className="mb-3 font-semibold">{title}</h3><div className="space-y-2.5">{items.map(({ icon: Icon, value }, index) => <div key={`${value}-${index}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span className="break-all">{value}</span></div>)}</div></div>; }

function formatDate(value: string) { return dateFormatter.format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function formatCurrency(value: number) { return currencyFormatter.format(Number(value)); }
function compactCurrency(value: number) { if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ ₫`; if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu ₫`; return currencyFormatter.format(value); }
function getNights(booking: Booking) { return Math.max(1, Math.round((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000)); }
function hotelName(hotels: Hotel[], hotelId: string) { return hotels.find((hotel) => hotel.id === hotelId)?.name || hotelId.slice(0, 8); }
function paymentMethodLabel(method: Booking["paymentMethod"]) { const labels: Record<string, string> = { VNPAY: "VNPay", PAY_AT_HOTEL: "Thanh toán tại chỗ nghỉ", MOMO: "MoMo", ZALOPAY: "ZaloPay", CREDIT_CARD: "Thẻ tín dụng" }; return method ? labels[method] || method : "Chưa xác định"; }
function getActionIcon(status: BookingStatus) { if (status === "CANCELLED") return <XCircle className="h-6 w-6" />; if (status === "COMPLETED") return <CalendarCheck2 className="h-6 w-6" />; if (status === "CHECKED_IN") return <Clock3 className="h-6 w-6" />; return <CheckCircle2 className="h-6 w-6" />; }
function getActionCopy(status: BookingStatus) { if (status === "CANCELLED") return { title: "Hủy đặt phòng?", confirm: "Xác nhận hủy", iconClass: "bg-red-100 text-red-600", success: (code: string) => `Đã hủy booking ${code}`, description: (code: string) => `Booking ${code} sẽ bị hủy và không thể chuyển sang trạng thái khác sau thao tác này.` }; if (status === "COMPLETED") return { title: "Hoàn thành đặt phòng?", confirm: "Khách trả phòng", iconClass: "bg-sky-100 text-sky-600", success: (code: string) => `Đã hoàn thành booking ${code}`, description: (code: string) => `Xác nhận khách của booking ${code} đã trả phòng và hoàn tất kỳ lưu trú.` }; if (status === "CHECKED_IN") return { title: "Xác nhận nhận phòng?", confirm: "Khách nhận phòng", iconClass: "bg-indigo-100 text-indigo-600", success: (code: string) => `Khách đã nhận phòng ${code}`, description: (code: string) => `Đánh dấu khách của booking ${code} đã đến và đang lưu trú.` }; return { title: "Xác nhận đặt phòng?", confirm: "Xác nhận booking", iconClass: "bg-blue-100 text-blue-600", success: (code: string) => `Đã xác nhận booking ${code}`, description: (code: string) => `Booking ${code} sẽ chuyển sang trạng thái đã xác nhận và sẵn sàng phục vụ.` }; }
