import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Eye, XCircle, RotateCcw, CheckCircle2, History } from "lucide-react";
import { format } from "date-fns";

const mockBookings = [
  {
    id: "BK-10293",
    customerName: "Nguyễn Văn A",
    hotelName: "InterContinental Hanoi",
    checkIn: new Date("2023-11-20"),
    checkOut: new Date("2023-11-25"),
    totalPrice: "$1,200",
    status: "ACTIVE",
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "BK-10294",
    customerName: "Trần Thị B",
    hotelName: "Vinpearl Resort Nha Trang",
    checkIn: new Date("2023-12-01"),
    checkOut: new Date("2023-12-05"),
    totalPrice: "$850",
    status: "PENDING",
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "BK-10295",
    customerName: "Lê Văn C",
    hotelName: "Boutique Hotel Sài Gòn",
    checkIn: new Date("2023-10-15"),
    checkOut: new Date("2023-10-18"),
    totalPrice: "$300",
    status: "COMPLETED",
    createdAt: new Date("2023-10-01"),
  },
  {
    id: "BK-10296",
    customerName: "Phạm D",
    hotelName: "Đà Lạt Mộng Mơ Homestay",
    checkIn: new Date("2023-11-22"),
    checkOut: new Date("2023-11-24"),
    totalPrice: "$120",
    status: "CANCELLED",
    createdAt: new Date("2023-11-20"),
  },
];

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = mockBookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Quản lý Booking
          </h2>
          <p className="text-muted-foreground mt-1">
            Tra cứu thông tin đặt phòng, xử lý hoàn tiền hoặc hủy đơn thủ công.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Mã booking, tên khách, khách sạn..."
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              <TableHead className="w-[100px]">Mã Đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Khách sạn</TableHead>
              <TableHead>Lịch trình (In - Out)</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-blue-600 dark:text-blue-400">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{booking.customerName}</span>
                      <span className="text-xs text-muted-foreground">Tạo: {format(booking.createdAt, "dd/MM/yyyy")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{booking.hotelName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
                      <span>In: {format(booking.checkIn, "dd/MM/yyyy")}</span>
                      <span>Out: {format(booking.checkOut, "dd/MM/yyyy")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">{booking.totalPrice}</TableCell>
                  <TableCell>
                    {booking.status === "ACTIVE" && <Badge className="bg-blue-500 hover:bg-blue-600">Đang lưu trú</Badge>}
                    {booking.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Chờ xác nhận</Badge>}
                    {booking.status === "COMPLETED" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Hoàn thành</Badge>}
                    {booking.status === "CANCELLED" && <Badge variant="destructive">Đã hủy</Badge>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Chi tiết Booking</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <History className="mr-2 h-4 w-4 text-indigo-500" />
                          <span>Timeline trạng thái</span>
                        </DropdownMenuItem>
                        
                        {(booking.status === "PENDING" || booking.status === "ACTIVE") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Force Cancel (Hủy)</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {booking.status === "ACTIVE" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Force Complete</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {booking.status === "CANCELLED" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              <span>Xử lý Hoàn tiền (Refund)</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy đơn đặt phòng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
