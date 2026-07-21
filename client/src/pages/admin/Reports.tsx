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
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

const mockReports = [
  {
    id: "REP-001",
    reporterName: "Nguyễn Văn A",
    targetType: "HOTEL",
    targetName: "Đà Lạt Mộng Mơ Homestay",
    reason: "Khách sạn lừa đảo, không có thật ở địa chỉ này",
    status: "PENDING",
    createdAt: new Date("2023-11-23T10:30:00"),
  },
  {
    id: "REP-002",
    reporterName: "Trần Thị B",
    targetType: "USER",
    targetName: "Spammer123",
    reason: "Người dùng gửi tin nhắn rác liên tục",
    status: "RESOLVED",
    createdAt: new Date("2023-11-22T14:15:00"),
  },
  {
    id: "REP-003",
    reporterName: "Lê Văn C",
    targetType: "REVIEW",
    targetName: "Đánh giá REV-003",
    reason: "Nội dung chửi bới, xúc phạm",
    status: "REJECTED",
    createdAt: new Date("2023-11-21T09:00:00"),
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = mockReports.filter(
    (report) =>
      report.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Báo cáo / Khiếu nại
          </h2>
          <p className="text-muted-foreground mt-1">
            Xử lý các báo cáo từ người dùng về khách sạn giả mạo, lừa đảo hoặc nội dung xấu.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo nội dung, đối tượng, người báo cáo..."
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
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[150px]">Người báo cáo</TableHead>
              <TableHead className="w-[180px]">Đối tượng bị báo cáo</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead className="w-[150px]">Ngày báo cáo</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{report.id}</TableCell>
                  <TableCell className="font-medium">{report.reporterName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{report.targetName}</span>
                      <Badge variant="outline" className="w-fit mt-1 text-[10px] uppercase">
                        {report.targetType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      <ShieldAlert className="inline h-3 w-3 mr-1" />
                      {report.reason}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(report.createdAt, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {report.status === "RESOLVED" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã giải quyết</Badge>}
                    {report.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Đang chờ xử lý</Badge>}
                    {report.status === "REJECTED" && <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Từ chối</Badge>}
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
                          <span>Xem Bằng chứng</span>
                        </DropdownMenuItem>
                        
                        {report.status === "PENDING" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Đánh dấu Đã giải quyết</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-slate-600 focus:text-slate-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Từ chối (Báo cáo sai)</span>
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
                  Không tìm thấy báo cáo nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
