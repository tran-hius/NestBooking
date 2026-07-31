import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BedDouble, CalendarCheck, CircleDollarSign, Clock3, UserRound } from "lucide-react";
import { bookingService } from "@/api/services/bookingService";
import { hotelService } from "@/api/services/hotelService";
import { userService } from "@/api/services/userService";
import { Booking, Hotel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminUser { id: string; email: string; role: string; status: string; createdAt: string; profile?: { fullName?: string | null } | null }

const statusLabel = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", COMPLETED: "Hoàn thành" } as const;
const statusClass = { PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700", CANCELLED: "bg-red-100 text-red-700", COMPLETED: "bg-emerald-100 text-emerald-700" } as const;

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    Promise.all([bookingService.getAllBookings(), hotelService.getAllHotels(1, 100), userService.getAllUsers()])
      .then(([bookingResponse, hotelResponse, userResponse]) => {
        setBookings(bookingResponse.data);
        setHotels(hotelResponse.data.data);
        setUsers(userResponse.data);
      })
      .catch((error) => { console.error("Failed to load admin dashboard:", error); setHasError(true); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Đang tải dữ liệu quản trị...</div>;
  if (hasError) return <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Không thể tải dashboard. Vui lòng kiểm tra API và thử lại.</div>;

  const revenue = bookings.filter((booking) => booking.status === "COMPLETED" && booking.paymentStatus === "PAID").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const pendingHotels = hotels.filter((hotel) => hotel.status === "PENDING").length;
  const pendingAgents = users.filter((user) => user.role === "AGENT" && user.status === "PENDING").length;
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime()).slice(0, 6);
  const cityStats = Array.from(hotels.reduce((map, hotel) => map.set(hotel.city, (map.get(hotel.city) || 0) + 1), new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Tổng quan hệ thống</h1><p className="mt-1 text-muted-foreground">Số liệu trực tiếp từ người dùng, chỗ nghỉ và booking hiện có.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Doanh thu đã thu</CardTitle><CircleDollarSign className="h-5 w-5 text-emerald-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{revenue.toLocaleString("vi-VN")} VND</div><p className="text-xs text-muted-foreground">Booking hoàn thành và đã thanh toán</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Tổng booking</CardTitle><CalendarCheck className="h-5 w-5 text-blue-600" /></CardHeader><CardContent><div className="text-3xl font-bold">{bookings.length}</div><p className="text-xs text-muted-foreground">{bookings.filter((booking) => booking.status === "CONFIRMED").length} đang được xác nhận</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Tài khoản</CardTitle><UserRound className="h-5 w-5 text-violet-600" /></CardHeader><CardContent><div className="text-3xl font-bold">{users.length}</div><p className="text-xs text-muted-foreground">{pendingAgents} đối tác đang chờ duyệt</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Chỗ nghỉ</CardTitle><BedDouble className="h-5 w-5 text-orange-600" /></CardHeader><CardContent><div className="text-3xl font-bold">{hotels.length}</div><p className="text-xs text-muted-foreground">{pendingHotels} chỗ nghỉ đang chờ duyệt</p></CardContent></Card>
    </div>
    {(pendingHotels > 0 || pendingAgents > 0) && <Card className="border-amber-200 bg-amber-50"><CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><Clock3 className="h-6 w-6 text-amber-600" /><div><div className="font-semibold text-amber-900">Có dữ liệu đang chờ kiểm duyệt</div><div className="text-sm text-amber-700">{pendingHotels} chỗ nghỉ và {pendingAgents} đối tác cần xử lý.</div></div></div><div className="flex gap-2"><Button variant="outline" asChild><Link to="/admin/agents">Duyệt đối tác</Link></Button><Button asChild><Link to="/admin/hotels">Duyệt chỗ nghỉ</Link></Button></div></CardContent></Card>}
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Booking gần đây</CardTitle><Button variant="ghost" size="sm" asChild><Link to="/admin/bookings">Xem tất cả<ArrowRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader><CardContent className="space-y-3">{recentBookings.length ? recentBookings.map((booking) => <div key={booking.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><div className="truncate font-semibold">{booking.guestName}</div><div className="truncate text-sm text-muted-foreground">{booking.bookingCode} · {booking.hotel?.name || "Chỗ nghỉ"}</div></div><div className="shrink-0 text-right"><Badge className={statusClass[booking.status]}>{statusLabel[booking.status]}</Badge><div className="mt-1 text-sm font-medium">{Number(booking.totalAmount).toLocaleString("vi-VN")} VND</div></div></div>) : <p className="text-muted-foreground">Chưa có booking.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Phân bố chỗ nghỉ</CardTitle></CardHeader><CardContent className="space-y-3">{cityStats.map(([city, count]) => <div key={city} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="font-medium">{city}</span><Badge variant="secondary">{count} chỗ nghỉ</Badge></div>)}</CardContent></Card>
    </div>
  </div>;
}
