import { useState, useMemo } from "react";
import { format } from "date-fns";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  History,
  XCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

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

  const filteredBookings = useMemo(() => {
    return mockBookings.filter(
      (booking) =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const columns: Column<typeof mockBookings[0]>[] = [
    {
      header: "Mã Đơn",
      accessorKey: "id",
      className: "w-[100px] font-medium text-blue-600 dark:text-blue-400",
    },
    {
      header: "Khách hàng",
      cell: (booking) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{booking.customerName}</span>
          <span className="text-xs text-muted-foreground">Tạo: {format(booking.createdAt, "dd/MM/yyyy")}</span>
        </div>
      ),
    },
    {
      header: "Khách sạn",
      accessorKey: "hotelName",
      className: "font-medium",
    },
    {
      header: "Lịch trình (In - Out)",
      cell: (booking) => (
        <div className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
          <span>In: {format(booking.checkIn, "dd/MM/yyyy")}</span>
          <span>Out: {format(booking.checkOut, "dd/MM/yyyy")}</span>
        </div>
      ),
    },
    {
      header: "Tổng tiền",
      accessorKey: "totalPrice",
      className: "font-bold text-slate-800 dark:text-slate-200",
    },
    {
      header: "Trạng thái",
      cell: (booking) => (
        <>
          {booking.status === "ACTIVE" && <Badge className="bg-blue-500 hover:bg-blue-600">Đang lưu trú</Badge>}
          {booking.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Chờ xác nhận</Badge>}
          {booking.status === "COMPLETED" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Hoàn thành</Badge>}
          {booking.status === "CANCELLED" && <Badge variant="destructive">Đã hủy</Badge>}
        </>
      ),
    },
    {
      header: "",
      className: "w-[70px]",
      cell: (booking) => (
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
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <DataTable
        title="Quản lý Booking"
        subtitle="Tra cứu thông tin đặt phòng, xử lý hoàn tiền hoặc hủy đơn thủ công."
        data={filteredBookings}
        columns={columns}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Mã booking, tên khách, khách sạn..."
        emptyMessage="Không tìm thấy đơn đặt phòng nào."
      />
    </div>
  );
}
