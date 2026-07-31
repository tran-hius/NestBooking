import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { bookingService } from "@/api/services/bookingService";
import { Booking, BookingStatus, Hotel } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
const formatCurrency = (value: number) => `${Number(value).toLocaleString("vi-VN")} VND`;

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  COMPLETED: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
};

const paymentStatusLabel = { UNPAID: "Chưa thanh toán", PAID: "Đã thanh toán", REFUNDED: "Đã hoàn tiền" } as const;

export default function AgentBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState(searchParams.get("hotelId") || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    hotelService.getMyHotels()
      .then(({ data }) => {
        setHotels(data.data);
        setHotelId((current) => data.data.some((hotel) => hotel.id === current) ? current : data.data[0]?.id || "");
      })
      .catch(() => toast.error("Không thể tải danh sách chỗ nghỉ"))
      .finally(() => setIsLoadingHotels(false));
  }, []);

  const loadBookings = async (id: string) => {
    if (!id) {
      setBookings([]);
      return;
    }
    setIsLoadingBookings(true);
    try {
      const response = await bookingService.getHotelBookings(id);
      setBookings(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch đặt phòng");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (hotelId) setSearchParams({ hotelId }, { replace: true });
    void loadBookings(hotelId);
  }, [hotelId, setSearchParams]);

  const updateStatus = async (booking: Booking, nextStatus: BookingStatus) => {
    const actionLabel = nextStatus === "CONFIRMED" ? "xác nhận" : nextStatus === "COMPLETED" ? "hoàn thành" : "hủy";
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} booking ${booking.bookingCode}?`)) return;

    setUpdatingBookingId(booking.id);
    try {
      const response = await bookingService.updateBookingStatus(booking.id, nextStatus);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, ...response.data } : item));
      toast.success(`Đã ${actionLabel} booking ${booking.bookingCode}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái booking");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const filtered = bookings.filter((booking) => {
    const matchesStatus = status === "ALL" || booking.status === status;
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || `${booking.bookingCode} ${booking.guestName} ${booking.guestEmail} ${booking.guestPhone} ${booking.roomType?.name || ""}`.toLowerCase().includes(keyword);
    return matchesStatus && matchesSearch;
  });

  const summary = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "PENDING").length,
    confirmed: bookings.filter((booking) => booking.status === "CONFIRMED").length,
    completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
  };

  const columns: Column<Booking>[] = [
    { header: "Mã booking", cell: (booking) => <div><div className="font-semibold">{booking.bookingCode}</div><div className="text-xs text-muted-foreground">{booking.createdAt ? `Tạo ${formatDate(booking.createdAt)}` : ""}</div></div> },
    { header: "Khách lưu trú", cell: (booking) => <div><div className="font-medium">{booking.guestName}</div><div className="text-xs text-muted-foreground">{booking.guestPhone}</div><div className="text-xs text-muted-foreground">{booking.guestEmail}</div></div> },
    { header: "Phòng", cell: (booking) => <div><div className="font-medium">{booking.roomType?.name || booking.roomTypeId.slice(0, 8)}</div><div className="text-xs text-muted-foreground">{booking.quantity} phòng</div></div> },
    { header: "Thời gian lưu trú", cell: (booking) => <div><div>{formatDate(booking.checkInDate)}</div><div className="text-xs text-muted-foreground">đến {formatDate(booking.checkOutDate)}</div></div> },
    { header: "Thanh toán", cell: (booking) => <div><div className="font-medium">{formatCurrency(booking.totalAmount)}</div><div className={`text-xs ${booking.paymentStatus === "PAID" ? "text-emerald-600" : "text-muted-foreground"}`}>{paymentStatusLabel[booking.paymentStatus]}</div></div> },
    { header: "Trạng thái", cell: (booking) => <Badge className={statusConfig[booking.status].className}>{statusConfig[booking.status].label}</Badge> },
    { header: "Thao tác", className: "text-right", cell: (booking) => {
      const isUpdating = updatingBookingId === booking.id;
      return <div className="flex min-w-[190px] justify-end gap-2">
        {booking.status === "PENDING" && <Button size="sm" disabled={isUpdating} onClick={() => void updateStatus(booking, "CONFIRMED")}>Xác nhận</Button>}
        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && <Button size="sm" variant="outline" disabled={isUpdating} className="text-destructive" onClick={() => void updateStatus(booking, "CANCELLED")}>Hủy</Button>}
        {booking.status === "CONFIRMED" && <Button size="sm" disabled={isUpdating} onClick={() => void updateStatus(booking, "COMPLETED")}>Hoàn thành</Button>}
        {(booking.status === "CANCELLED" || booking.status === "COMPLETED") && <span className="py-2 text-xs text-muted-foreground">Không còn thao tác</span>}
      </div>;
    } },
  ];

  if (isLoadingHotels) return <div className="py-20 text-center text-muted-foreground">Đang tải lịch đặt phòng...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="w-full max-w-md">
          <label className="mb-2 block text-sm font-medium">Chỗ nghỉ</label>
          <Select value={hotelId} onValueChange={setHotelId} disabled={hotels.length === 0}>
            <SelectTrigger><SelectValue placeholder="Chọn chỗ nghỉ" /></SelectTrigger>
            <SelectContent>{hotels.map((hotel) => <SelectItem key={hotel.id} value={hotel.id}>{hotel.name} · {hotel.city}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="w-48">
            <label className="mb-2 block text-sm font-medium">Trạng thái</label>
            <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem>{Object.entries(statusConfig).map(([value, config]) => <SelectItem key={value} value={value}>{config.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" aria-label="Tải lại lịch đặt phòng" disabled={!hotelId || isLoadingBookings} onClick={() => void loadBookings(hotelId)}><RefreshCw className={`h-4 w-4 ${isLoadingBookings ? "animate-spin" : ""}`} /></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-muted-foreground">Tổng booking</p><p className="text-2xl font-bold">{summary.total}</p></div><CalendarDays className="h-8 w-8 text-slate-400" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-muted-foreground">Chờ xác nhận</p><p className="text-2xl font-bold text-amber-600">{summary.pending}</p></div><Clock3 className="h-8 w-8 text-amber-500" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-muted-foreground">Đã xác nhận</p><p className="text-2xl font-bold text-blue-600">{summary.confirmed}</p></div><CheckCircle2 className="h-8 w-8 text-blue-500" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-muted-foreground">Hoàn thành</p><p className="text-2xl font-bold text-emerald-600">{summary.completed}</p></div><XCircle className="h-8 w-8 text-emerald-500" /></CardContent></Card>
      </div>

      <DataTable
        title="Lịch đặt phòng"
        subtitle={isLoadingBookings ? "Đang cập nhật dữ liệu..." : `${filtered.length} booking phù hợp với bộ lọc`}
        data={filtered}
        columns={columns}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã booking, khách, email hoặc loại phòng"
        emptyMessage={hotelId ? "Không có booking phù hợp." : "Bạn chưa có chỗ nghỉ."}
      />
    </div>
  );
}
