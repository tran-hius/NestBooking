import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Building, CalendarCheck, CalendarX, Building2, MapPin, Percent, BedDouble, CalendarClock, UserPlus } from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

const revenueData = [
  { name: "Tháng 1", total: 4000 },
  { name: "Tháng 2", total: 3000 },
  { name: "Tháng 3", total: 5000 },
  { name: "Tháng 4", total: 4500 },
  { name: "Tháng 5", total: 6000 },
  { name: "Tháng 6", total: 8000 },
];

const bookingData = [
  { name: "T2", bookings: 120 },
  { name: "T3", bookings: 150 },
  { name: "T4", bookings: 180 },
  { name: "T5", bookings: 140 },
  { name: "T6", bookings: 210 },
  { name: "T7", bookings: 350 },
  { name: "CN", bookings: 400 },
];

const topHotels = [
  { name: "InterContinental Hanoi", bookings: 342, revenue: "$12,450", rating: 4.9 },
  { name: "Vinpearl Resort Nha Trang", bookings: 289, revenue: "$9,200", rating: 4.8 },
  { name: "Sheraton Saigon", bookings: 256, revenue: "$15,100", rating: 4.7 },
  { name: "Muong Thanh Da Nang", bookings: 210, revenue: "$5,400", rating: 4.5 },
  { name: "Pullman Vung Tau", bookings: 198, revenue: "$7,200", rating: 4.6 },
];

const topLocations = [
  { name: "Đà Nẵng", bookings: 1250, growth: "+15%" },
  { name: "Nha Trang", bookings: 980, growth: "+8%" },
  { name: "Phú Quốc", bookings: 850, growth: "+22%" },
  { name: "Hà Nội", bookings: 760, growth: "+5%" },
  { name: "Đà Lạt", bookings: 650, growth: "-2%" },
];

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between space-y-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Tổng quan (Dashboard)
          </h2>
          <p className="text-muted-foreground mt-1">Theo dõi hoạt động kinh doanh của NestBooking hôm nay</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1 */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">$45,231.89</div>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ +20.1% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Hôm Nay</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">145</div>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ +12 so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Đang Diễn Ra</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">892</div>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
              Khách đang lưu trú
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Đã Hủy</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <CalendarX className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">23</div>
            <p className="text-xs font-medium text-red-500 mt-1 flex items-center">
              ↓ -5% so với tuần trước
            </p>
          </CardContent>
        </Card>

        {/* Row 2 */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Lấp Đầy</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Percent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">76.4%</div>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ +2.4% toàn hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người Dùng Mới</CardTitle>
            <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">+2,350</div>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
              Trong 30 ngày qua
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đối Tác Mới</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">+124</div>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              ↑ 15 đối tác chờ duyệt
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Sạn Mới</CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
              <BedDouble className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">+45</div>
            <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
              Đã đưa lên nền tảng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-0 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Biểu đồ Doanh Thu (6 tháng)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--tw-colors-zinc-900)', color: 'white' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} className="fill-blue-500 hover:fill-blue-400 transition-colors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Xu Hướng Booking (Tuần qua)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--tw-colors-zinc-900)', color: 'white' }} />
                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-0 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Top Khách Sạn (Lượt Đặt)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHotels.map((hotel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{hotel.name}</h4>
                      <p className="text-xs text-muted-foreground">{hotel.bookings} bookings • ⭐ {hotel.rating}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {hotel.revenue}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Top Địa Điểm Trọng Điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLocations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{loc.name}</h4>
                      <p className="text-xs text-muted-foreground">{loc.bookings} bookings tháng này</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${loc.growth.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {loc.growth}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
