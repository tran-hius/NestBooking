import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building, CalendarCheck, CircleDollarSign, Plus } from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { bookingService } from "@/api/services/bookingService";
import { Booking, Hotel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AgentDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const hotelResponse = await hotelService.getMyHotels();
        const hotelList = hotelResponse.data.data;
        setHotels(hotelList);
        const bookingResponses = await Promise.all(hotelList.map((hotel) => bookingService.getHotelBookings(hotel.id).catch(() => null)));
        setBookings(bookingResponses.flatMap((response) => response?.data || []));
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  const confirmedRevenue = bookings.filter((booking) => booking.status === "COMPLETED").reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime()).slice(0, 5);
  const statusLabel: Record<Booking["status"], string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", COMPLETED: "Hoàn thành" };
  const statusClass: Record<Booking["status"], string> = { PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700", CANCELLED: "bg-red-100 text-red-700", COMPLETED: "bg-emerald-100 text-emerald-700" };
  if (loading) return <div className="py-20 text-center text-muted-foreground">Đang tải dashboard...</div>;

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="text-3xl font-bold">Tổng quan đối tác</h2><p className="mt-1 text-muted-foreground">Dữ liệu thật từ các chỗ nghỉ và booking của bạn</p></div><Button asChild><Link to="/partner/property-type"><Plus className="mr-2 h-4 w-4" />Tạo chỗ nghỉ</Link></Button></div>
    <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Tổng chỗ nghỉ</CardTitle><Building className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">{hotels.length}</div><p className="text-xs text-muted-foreground">{activeHotels} đang hoạt động</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Tổng booking</CardTitle><CalendarCheck className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">{bookings.length}</div><p className="text-xs text-muted-foreground">{bookings.filter((item) => item.status === "CONFIRMED").length} đã xác nhận</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Doanh thu hoàn thành</CardTitle><CircleDollarSign className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{confirmedRevenue.toLocaleString("vi-VN")} VND</div><p className="text-xs text-muted-foreground">Từ booking COMPLETED</p></CardContent></Card></div>
    <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Chỗ nghỉ của bạn</CardTitle></CardHeader><CardContent className="space-y-3">{hotels.length ? hotels.map((hotel) => <Link key={hotel.id} to={`/partner/hotels/${hotel.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"><div><div className="font-semibold">{hotel.name}</div><div className="text-sm text-muted-foreground">{hotel.city}</div></div><Badge variant={hotel.status === "ACTIVE" ? "default" : "secondary"}>{hotel.status}</Badge></Link>) : <p className="text-muted-foreground">Chưa có chỗ nghỉ.</p>}</CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Đặt phòng gần đây</CardTitle><Button variant="ghost" size="sm" asChild><Link to="/partner/bookings">Xem lịch đặt phòng<ArrowRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader><CardContent className="space-y-3">{recent.length ? recent.map((booking) => <Link key={booking.id} to={`/partner/bookings?hotelId=${booking.hotelId}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-slate-50"><div className="min-w-0"><div className="truncate font-semibold">{booking.guestName}</div><div className="truncate text-sm text-muted-foreground">{booking.bookingCode} · {booking.hotel?.name || "Chỗ nghỉ"}</div><div className="mt-1 text-xs text-muted-foreground">Nhận phòng {new Date(booking.checkInDate).toLocaleDateString("vi-VN")}</div></div><div className="shrink-0 text-right"><Badge className={statusClass[booking.status]}>{statusLabel[booking.status]}</Badge><div className="mt-1 text-sm font-medium">{Number(booking.totalAmount).toLocaleString("vi-VN")} VND</div></div></Link>) : <p className="text-muted-foreground">Chưa có booking.</p>}</CardContent></Card></div>
  </div>;
}
