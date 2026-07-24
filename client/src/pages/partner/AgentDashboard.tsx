import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Building, CalendarCheck, CalendarX, BedDouble, Percent, Clock } from "lucide-react";
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
  { name: "Tháng 1", total: 1200 },
  { name: "Tháng 2", total: 1500 },
  { name: "Tháng 3", total: 1000 },
  { name: "Tháng 4", total: 2200 },
  { name: "Tháng 5", total: 2800 },
  { name: "Tháng 6", total: 3100 },
];

const bookingData = [
  { name: "T2", bookings: 12 },
  { name: "T3", bookings: 15 },
  { name: "T4", bookings: 18 },
  { name: "T5", bookings: 14 },
  { name: "T6", bookings: 21 },
  { name: "T7", bookings: 35 },
  { name: "CN", bookings: 40 },
];

const myHotels = [
  { name: "Boutique Hanoi Central", bookings: 42, revenue: "$2,450", rating: 4.9 },
  { name: "Cozy Homestay Da Lat", bookings: 28, revenue: "$1,200", rating: 4.8 },
  { name: "Nha Trang Seaside Villa", bookings: 56, revenue: "$5,100", rating: 4.7 },
];

const recentBookings = [
  { id: "BK-1002", guest: "Nguyễn Văn A", hotel: "Boutique Hanoi Central", dates: "12/08 - 14/08", status: "Confirmed", amount: "$150" },
  { id: "BK-1003", guest: "Trần Thị B", hotel: "Cozy Homestay Da Lat", dates: "15/08 - 18/08", status: "Pending", amount: "$210" },
  { id: "BK-1004", guest: "Lê Văn C", hotel: "Nha Trang Seaside Villa", dates: "20/08 - 25/08", status: "Cancelled", amount: "$800" },
  { id: "BK-1005", guest: "Phạm Thị D", hotel: "Boutique Hanoi Central", dates: "22/08 - 23/08", status: "Confirmed", amount: "$75" },
];

export default function AgentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng quan hiệu suất</h2>
          <p className="text-muted-foreground mt-1">Theo dõi hoạt động kinh doanh các chỗ nghỉ của bạn</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Tổng doanh thu
            </CardTitle>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$11,800</div>
            <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1 flex items-center">
              +15.2% <span className="text-muted-foreground font-normal ml-1">so với tháng trước</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Lượt đặt phòng
            </CardTitle>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">126</div>
            <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1 flex items-center">
              +8.1% <span className="text-muted-foreground font-normal ml-1">so với tháng trước</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Chỗ nghỉ của bạn
            </CardTitle>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500 rounded-full flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang hoạt động trên hệ thống
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Tỷ lệ lấp đầy
            </CardTitle>
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">68%</div>
            <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1 flex items-center">
              +4.5% <span className="text-muted-foreground font-normal ml-1">so với tháng trước</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Lượt đặt phòng 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Booking gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{booking.guest}</p>
                      <p className="text-xs text-muted-foreground truncate w-48">{booking.hotel}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {booking.dates}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{booking.amount}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1
                      ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        booking.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Chỗ nghỉ hiệu quả nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myHotels.map((hotel, i) => (
                <div key={hotel.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-slate-500">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{hotel.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ⭐ {hotel.rating} / 5.0
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{hotel.revenue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{hotel.bookings} bookings</p>
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
