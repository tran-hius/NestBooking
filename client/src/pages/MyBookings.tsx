import { useEffect, useState } from "react";
import { bookingService } from "@/api/services/bookingService";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin, Search, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/stores/useAppStore";

interface BookingItem {
  id: string;
  bookingCode: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  hotel?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    images?: { imageUrl: string }[];
  };
  roomType?: { id: string; name: string };
}

const getStatusBadge = (status: BookingItem["status"]) => {
  if (status === "CONFIRMED") return <Badge className="border-none bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600"><CheckCircle2 className="mr-1.5 h-4 w-4" />Đã xác nhận</Badge>;
  if (status === "PENDING") return <Badge className="border-none bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600"><Clock className="mr-1.5 h-4 w-4" />Chờ thanh toán</Badge>;
  if (status === "CANCELLED") return <Badge className="border-none bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive"><XCircle className="mr-1.5 h-4 w-4" />Đã hủy</Badge>;
  return <Badge className="border-none bg-primary/10 px-3 py-1 text-sm font-medium text-primary"><CheckCircle2 className="mr-1.5 h-4 w-4" />Đã hoàn thành</Badge>;
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });

export default function MyBookings() {
  const { isAuthenticated } = useAppStore();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("ALL");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch {
      setError("Không thể tải danh sách đặt phòng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) void fetchBookings();
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchParams.get("created")) toast.success("Đặt phòng thành công. Booking mới đã được thêm vào danh sách.");
  }, [searchParams]);

  if (!isAuthenticated) return <Navigate to="/login?redirect=/my-bookings" replace />;

  const filteredBookings = bookings.filter((booking) => filter === "ALL" || booking.status === filter);

  const cancelBooking = async (booking: BookingItem) => {
    if (!window.confirm(`Bạn có chắc muốn hủy booking ${booking.bookingCode}?`)) return;
    try {
      await bookingService.cancelBooking(booking.id);
      toast.success("Hủy đặt phòng thành công");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đặt phòng");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10 pt-28">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chuyến đi của tôi</h1>
          <p className="mt-2 text-muted-foreground">Quản lý tất cả các đặt phòng của bạn tại đây.</p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-4">
          {[
            ["ALL", "Tất cả chuyến đi"],
            ["PENDING", "Chờ thanh toán"],
            ["CONFIRMED", "Đã xác nhận"],
            ["CANCELLED", "Đã hủy"],
          ].map(([value, label]) => (
            <Button key={value} variant={filter === value ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(value)}>{label}</Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => void fetchBookings()}>Thử lại</Button>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-50 md:h-auto md:w-64">
                    <img src={booking.hotel?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"} alt={booking.hotel?.name || "Hotel"} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3">{getStatusBadge(booking.status)}</div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-foreground"><Link to={`/hotel/${booking.hotelId}`} className="hover:text-primary">{booking.hotel?.name || "Khách sạn"}</Link></h3>
                        <span className="text-sm font-medium text-muted-foreground">{booking.bookingCode}</span>
                      </div>
                      <div className="mb-4 flex items-center text-sm text-muted-foreground"><MapPin className="mr-1 h-4 w-4" />{booking.hotel?.address || booking.hotel?.city || "Vietnam"}</div>
                      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-slate-50 p-3">
                        <div><div className="text-xs font-semibold uppercase text-muted-foreground">Nhận phòng</div><div className="mt-1 font-medium">{formatDate(booking.checkInDate)}</div></div>
                        <div><div className="text-xs font-semibold uppercase text-muted-foreground">Trả phòng</div><div className="mt-1 font-medium">{formatDate(booking.checkOutDate)}</div></div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div><div className="text-sm text-muted-foreground">{booking.roomType?.name || "Phòng đã chọn"}</div><div className="mt-1 text-xl font-black">{Number(booking.totalAmount).toLocaleString("vi-VN")} <span className="text-sm font-normal text-muted-foreground">VND</span></div></div>
                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => void cancelBooking(booking)}>Hủy đặt phòng</Button>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"><CalendarDays className="h-12 w-12 text-primary" /></div>
            <h3 className="mb-2 text-2xl font-bold">Bạn chưa có chuyến đi nào</h3>
            <p className="mb-8 max-w-md text-muted-foreground">Hãy tìm một khách sạn phù hợp và bắt đầu chuyến đi tiếp theo.</p>
            <Link to="/search"><Button size="lg" className="gap-2 rounded-full px-8"><Search className="h-5 w-5" />Booking ngay</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
