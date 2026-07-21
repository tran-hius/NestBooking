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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Search, FileCheck, XCircle, Building, Ban, Eye, FileText } from "lucide-react";
import { format } from "date-fns";

const mockAgents = [
  {
    id: "AGT-001",
    name: "Công ty TNHH Du lịch Hà Nội",
    contactName: "Nguyễn Văn A",
    email: "contact@hanoitravel.vn",
    status: "PENDING",
    createdAt: new Date("2023-11-01"),
    logo: "",
    hotelsCount: 1,
    kycStatus: "SUBMITTED" // SUBMITTED, VERIFIED, REJECTED
  },
  {
    id: "AGT-002",
    name: "Resort & Spa Đà Nẵng",
    contactName: "Trần Thị B",
    email: "booking@danangresort.com",
    status: "APPROVED",
    createdAt: new Date("2023-08-15"),
    logo: "https://i.pravatar.cc/150?u=a2",
    hotelsCount: 3,
    kycStatus: "VERIFIED"
  },
  {
    id: "AGT-003",
    name: "Khách sạn Mường Thanh",
    contactName: "Lê Văn C",
    email: "admin@muongthanh.vn",
    status: "SUSPENDED",
    createdAt: new Date("2022-05-10"),
    logo: "https://i.pravatar.cc/150?u=a3",
    hotelsCount: 12,
    kycStatus: "VERIFIED"
  },
  {
    id: "AGT-004",
    name: "Boutique Hotel Sài Gòn",
    contactName: "Phạm D",
    email: "hello@boutiquesg.com",
    status: "REJECTED",
    createdAt: new Date("2023-11-05"),
    logo: "",
    hotelsCount: 0,
    kycStatus: "REJECTED"
  },
];

export default function AgentManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = mockAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Duyệt & Quản lý Đối Tác
          </h2>
          <p className="text-muted-foreground mt-1">
            Xác minh KYC, duyệt đối tác mới và quản lý trạng thái tài khoản Agent.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên công ty, email, ID..."
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Xuất báo cáo</Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Tên Đối Tác (Công ty)</TableHead>
              <TableHead>Hồ Sơ (KYC)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="text-right">Khách sạn</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{agent.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700 rounded-md">
                        <AvatarImage src={agent.logo} />
                        <AvatarFallback className="rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          <Building className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">{agent.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.kycStatus === "VERIFIED" && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Đã xác minh</Badge>}
                    {agent.kycStatus === "SUBMITTED" && <Badge variant="outline" className="text-blue-500 border-blue-500/30">Chờ kiểm duyệt</Badge>}
                    {agent.kycStatus === "REJECTED" && <Badge variant="outline" className="text-red-500 border-red-500/30">Từ chối</Badge>}
                  </TableCell>
                  <TableCell>
                    {agent.status === "APPROVED" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã duyệt</Badge>}
                    {agent.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Đang chờ</Badge>}
                    {agent.status === "REJECTED" && <Badge variant="destructive">Từ chối</Badge>}
                    {agent.status === "SUSPENDED" && <Badge className="bg-slate-500 hover:bg-slate-600">Đình chỉ</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(agent.createdAt, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {agent.hotelsCount > 0 ? agent.hotelsCount : "-"}
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
                          <span>Xem chi tiết Đối tác</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                          <span>Xem hồ sơ KYC (CCCD/MST)</span>
                        </DropdownMenuItem>
                        
                        {agent.status === "PENDING" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <FileCheck className="mr-2 h-4 w-4" />
                              <span>Duyệt đăng ký</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Từ chối</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {agent.status === "APPROVED" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Đình chỉ (Suspend)</span>
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
                  Không tìm thấy đối tác nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
