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
import { MoreHorizontal, Search, ShieldBan, Key, History, CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const mockUsers = [
  {
    id: "USR-001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "USER",
    status: "ACTIVE",
    createdAt: new Date("2023-01-15"),
    avatar: "https://i.pravatar.cc/150?u=1",
    bookingsCount: 12
  },
  {
    id: "USR-002",
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    role: "USER",
    status: "ACTIVE",
    createdAt: new Date("2023-02-20"),
    avatar: "https://i.pravatar.cc/150?u=2",
    bookingsCount: 3
  },
  {
    id: "USR-003",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    role: "USER",
    status: "BLOCKED",
    createdAt: new Date("2023-05-10"),
    avatar: "",
    bookingsCount: 0
  },
  {
    id: "USR-004",
    name: "Phạm D",
    email: "phamd@gmail.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: new Date("2022-11-05"),
    avatar: "https://i.pravatar.cc/150?u=4",
    bookingsCount: 0
  },
  {
    id: "USR-005",
    name: "Hoàng E",
    email: "hoange@gmail.com",
    role: "USER",
    status: "UNVERIFIED",
    createdAt: new Date("2023-10-12"),
    avatar: "",
    bookingsCount: 0
  },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Quản lý Người Dùng
          </h2>
          <p className="text-muted-foreground mt-1">
            Xem, tìm kiếm và quản lý tài khoản người dùng trên hệ thống.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, email, ID..."
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          Thêm Quản Trị Viên
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Booking</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className={user.role === "ADMIN" ? "bg-purple-500 hover:bg-purple-600" : ""}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.status === "ACTIVE" && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Hoạt động</Badge>}
                    {user.status === "BLOCKED" && <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">Đã khóa</Badge>}
                    {user.status === "UNVERIFIED" && <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">Chưa xác thực</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(user.createdAt, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.bookingsCount}
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
                          <History className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Xem chi tiết & Lịch sử</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <CalendarDays className="mr-2 h-4 w-4 text-indigo-500" />
                          <span>Lịch sử Booking</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "UNVERIFIED" && (
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                            <span>Xác minh thủ công</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer">
                          <Key className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "BLOCKED" ? (
                          <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                            <ShieldBan className="mr-2 h-4 w-4" />
                            <span>Mở khóa tài khoản</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                            <ShieldBan className="mr-2 h-4 w-4" />
                            <span>Khóa tài khoản</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
