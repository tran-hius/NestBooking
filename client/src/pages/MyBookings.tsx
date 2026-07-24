import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Search, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Giả lập dữ liệu booking (rỗng để test state chưa có booking)
// const MOCK_BOOKINGS = []; 
const MOCK_BOOKINGS: any[] = [
  // Uncomment đoạn dưới để test UI khi có dữ liệu
  /*
  {
    id: "BKG-123456",
    hotelName: "Boutique Hanoi Central Hotel & Spa",
    location: "Hoàn Kiếm, Hà Nội",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    checkIn: "2026-08-12",
    checkOut: "2026-08-14",
    status: "CONFIRMED", // PENDING, CONFIRMED, CANCELLED, COMPLETED
    price: 1780000,
    roomName: "Phòng Deluxe giường đôi",
    bookedAt: "2026-07-24T10:00:00Z"
  },
  {
    id: "BKG-654321",
    hotelName: "Sapa Horizon Hotel",
    location: "Sa Pa, Lào Cai",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    checkIn: "2026-09-01",
    checkOut: "2026-09-03",
    status: "PENDING", 
    price: 2500000,
    roomName: "Phòng Suite View Núi",
    bookedAt: "2026-07-20T10:00:00Z"
  }
  */
];

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
  const [filter, setFilter] = useState("ALL"); // ALL, UPCOMING, CANCELLED, COMPLETED
  
  // Filter logic có thể thêm sau, hiện tại dùng MOCK_BOOKINGS
  const bookings = MOCK_BOOKINGS;

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
            variant={filter === "UPCOMING" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("UPCOMING")}
          >
            Sắp tới
          </Button>
          <Button 
            variant={filter === "COMPLETED" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("COMPLETED")}
          >
            Đã hoàn thành
          </Button>
          <Button 
            variant={filter === "CANCELLED" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setFilter("CANCELLED")}
          >
            Đã hủy
          </Button>
        </div>

        {/* Danh sách Booking */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden bg-muted">
                    <img 
                      src={booking.image} 
                      alt={booking.hotelName} 
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
                          <Link to={`/booking/${booking.id}`}>{booking.hotelName}</Link>
                        </h3>
                        <span className="text-sm text-muted-foreground font-medium">ID: {booking.id}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.location}
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-3 border border-border">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Nhận phòng</div>
                          <div className="font-medium text-foreground mt-1">{formatDate(booking.checkIn)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Trả phòng</div>
                          <div className="font-medium text-foreground mt-1">{formatDate(booking.checkOut)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-6 pt-4 border-t border-border">
                      <div>
                        <div className="text-sm text-muted-foreground">{booking.roomName}</div>
                        <div className="text-xl font-black text-foreground mt-1">
                          {booking.price.toLocaleString('vi-VN')} <span className="text-sm font-normal text-muted-foreground">VND</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {booking.status === 'PENDING' && (
                          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">Hủy đặt phòng</Button>
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
