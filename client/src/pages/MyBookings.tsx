import { useState, useEffect } from "react";
import { bookingService } from "@/api/services/bookingService";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Search, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Giả lập dữ liệu booking (rỗng để test state chưa có booking)
// const MOCK_BOOKINGS = []; 
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-medium px-3 py-1 text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Đã xác nhận</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-medium px-3 py-1 text-sm"><Clock className="w-4 h-4 mr-1.5" /> Chờ thanh toán</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none font-medium px-3 py-1 text-sm"><XCircle className="w-4 h-4 mr-1.5" /> Đã hủy</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-medium px-3 py-1 text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Đã hoàn thành</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

export default function MyBookings() {
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, CONFIRMED, CANCELLED
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getMyBookings();
        setBookings(data.data || []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "ALL") return true;
    return booking.status === filter;
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-10">
      <div className="container mx-auto max-w-5xl px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chuyến đi của tôi</h1>
          <p className="text-muted-foreground mt-2">Quản lý và xem lại tất cả các đặt phòng của bạn tại đây.</p>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          <Button 
            variant={filter === "ALL" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("ALL")}
          >
            Tất cả chuyến đi
          </Button>
          <Button 
            variant={filter === "PENDING" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("PENDING")}
          >
            Chờ thanh toán
          </Button>
          <Button 
            variant={filter === "CONFIRMED" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("CONFIRMED")}
          >
            Đã xác nhận
          </Button>
          <Button 
            variant={filter === "CANCELLED" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("CANCELLED")}
          >
            Đã hủy
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden bg-muted">
                    <img 
                      src={booking.hotel?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                      alt={booking.hotel?.name || "Hotel"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          <Link to={`/hotel/${booking.hotelId}`}>{booking.hotel?.name}</Link>
                        </h3>
                        <span className="text-sm text-muted-foreground font-medium">ID: {booking.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.hotel?.address || booking.hotel?.city || "Vietnam"}
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-3 border border-border">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Nhận phòng</div>
                          <div className="font-medium text-foreground mt-1">{formatDate(booking.checkInDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Trả phòng</div>
                          <div className="font-medium text-foreground mt-1">{formatDate(booking.checkOutDate)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-6 pt-4 border-t border-border">
                      <div>
                        <div className="text-sm text-muted-foreground">{booking.roomType?.name || "Phòng Standard"}</div>
                        <div className="text-xl font-black text-foreground mt-1">
                          {booking.totalPrice.toLocaleString('vi-VN')} <span className="text-sm font-normal text-muted-foreground">VND</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {booking.status === 'PENDING' && (
                          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={async () => {
                            if (window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
                              try {
                                await bookingService.cancelBooking(booking.id);
                                const newData = await bookingService.getMyBookings();
                                setBookings(newData.data || []);
                              } catch(e) {}
                            }
                          }}>Hủy đặt phòng</Button>
                        )}
                        <Button className="gap-2">
                          Xem chi tiết
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State khi chưa có booking */
          <div className="bg-card rounded-3xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Bạn chưa có chuyến đi nào</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Thế giới bao la, muôn ngả chờ khám phá. Hãy bắt đầu lên kế hoạch cho kỳ nghỉ dưỡng tuyệt vời tiếp theo của bạn ngay hôm nay!
            </p>
            <Link to="/search">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 gap-2">
                <Search className="w-5 h-5" />
                Booking ngay
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

