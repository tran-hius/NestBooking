import { useEffect, useState } from "react";
import { bookingService } from "@/api/services/bookingService";
import { Booking, BookingStatus } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const labels: Record<BookingStatus, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", COMPLETED: "Hoàn thành" };
const colors: Record<BookingStatus, string> = { PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700", CANCELLED: "bg-red-100 text-red-700", COMPLETED: "bg-emerald-100 text-emerald-700" };
const formatDate = (value: string) => new Date(value).toLocaleDateString("vi-VN");

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  useEffect(() => { bookingService.getAllBookings().then((response) => setBookings(response.data)).catch(() => toast.error("Không thể tải booking")).finally(() => setLoading(false)); }, []);
  const update = async (booking: Booking, nextStatus: BookingStatus) => { if (!window.confirm(`Chuyển ${booking.bookingCode} sang ${labels[nextStatus]}?`)) return; try { setUpdating(booking.id); const response = await bookingService.updateBookingStatus(booking.id, nextStatus); setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, ...response.data } : item)); toast.success("Đã cập nhật booking"); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể cập nhật booking"); } finally { setUpdating(null); } };
  const filtered = bookings.filter((booking) => (status === "ALL" || booking.status === status) && `${booking.bookingCode} ${booking.guestName} ${booking.guestEmail} ${booking.hotel?.name || ""}`.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<Booking>[] = [
    { header: "Mã booking", cell: (booking) => <div><div className="font-semibold">{booking.bookingCode}</div><div className="text-xs text-muted-foreground">{booking.createdAt ? formatDate(booking.createdAt) : ""}</div></div> },
    { header: "Khách", cell: (booking) => <div><div>{booking.guestName}</div><div className="text-xs text-muted-foreground">{booking.guestEmail}</div></div> },
    { header: "Chỗ nghỉ", cell: (booking) => <div><div className="font-medium">{booking.hotel?.name || booking.hotelId.slice(0, 8)}</div><div className="text-xs text-muted-foreground">{booking.roomType?.name}</div></div> },
    { header: "Lưu trú", cell: (booking) => <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span> },
    { header: "Tổng tiền", cell: (booking) => <div><div className="font-medium">{Number(booking.totalAmount).toLocaleString("vi-VN")} VND</div><div className="text-xs text-muted-foreground">{booking.paymentStatus}</div></div> },
    { header: "Trạng thái", cell: (booking) => <Badge className={colors[booking.status]}>{labels[booking.status]}</Badge> },
    { header: "Thao tác", className: "text-right", cell: (booking) => <div className="flex min-w-[180px] justify-end gap-2">{booking.status === "PENDING" && <Button size="sm" disabled={updating === booking.id} onClick={() => void update(booking, "CONFIRMED")}>Xác nhận</Button>}{(booking.status === "PENDING" || booking.status === "CONFIRMED") && <Button size="sm" variant="outline" className="text-destructive" disabled={updating === booking.id} onClick={() => void update(booking, "CANCELLED")}>Hủy</Button>}{booking.status === "CONFIRMED" && <Button size="sm" disabled={updating === booking.id} onClick={() => void update(booking, "COMPLETED")}>Hoàn thành</Button>}</div> },
  ];
  if (loading) return <div className="py-20 text-center text-muted-foreground">Đang tải booking...</div>;
  return <div className="space-y-4"><div className="max-w-xs"><Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem>{Object.entries(labels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><DataTable title="Quản lý booking" subtitle={`${filtered.length} booking trên toàn hệ thống`} data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Mã booking, khách hoặc chỗ nghỉ" emptyMessage="Không có booking phù hợp." /></div>;
}
