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
import { MoreHorizontal, Search, Eye, RotateCcw, Download } from "lucide-react";
import { format } from "date-fns";

const mockPayments = [
  {
    id: "TXN-99812",
    bookingId: "BK-10293",
    customerName: "Nguyễn Văn A",
    amount: "$1,200",
    method: "Thẻ tín dụng (Visa)",
    status: "SUCCESS",
    createdAt: new Date("2023-11-15T10:30:00"),
  },
  {
    id: "TXN-99813",
    bookingId: "BK-10294",
    customerName: "Trần Thị B",
    amount: "$850",
    method: "ZaloPay",
    status: "SUCCESS",
    createdAt: new Date("2023-11-20T14:15:00"),
  },
  {
    id: "TXN-99814",
    bookingId: "BK-10296",
    customerName: "Phạm D",
    amount: "$120",
    method: "Thẻ tín dụng (Mastercard)",
    status: "REFUNDED",
    createdAt: new Date("2023-11-20T09:00:00"),
  },
  {
    id: "TXN-99815",
    bookingId: "BK-10297",
    customerName: "Hoàng E",
    amount: "$450",
    method: "Chuyển khoản ngân hàng",
    status: "FAILED",
    createdAt: new Date("2023-11-21T16:45:00"),
  },
];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = mockPayments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Quản lý Thanh toán
          </h2>
          <p className="text-muted-foreground mt-1">
            Theo dõi giao dịch, xử lý hoàn tiền và đối soát doanh thu.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Mã giao dịch, Mã booking, Khách hàng..."
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Xuất Excel
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              <TableHead className="w-[120px]">Mã Giao dịch</TableHead>
              <TableHead>Mã Booking</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{payment.id}</TableCell>
                  <TableCell className="text-blue-600 dark:text-blue-400">{payment.bookingId}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell className="text-slate-500">{payment.method}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(payment.createdAt, "HH:mm, dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">{payment.amount}</TableCell>
                  <TableCell>
                    {payment.status === "SUCCESS" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Thành công</Badge>}
                    {payment.status === "FAILED" && <Badge variant="destructive">Thất bại</Badge>}
                    {payment.status === "REFUNDED" && <Badge variant="outline" className="text-amber-500 border-amber-500/50">Đã hoàn tiền</Badge>}
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
                          <span>Chi tiết Giao dịch</span>
                        </DropdownMenuItem>
                        
                        {payment.status === "SUCCESS" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              <span>Xử lý Hoàn tiền</span>
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
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy giao dịch nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
