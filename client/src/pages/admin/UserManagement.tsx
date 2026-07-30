import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search, Eye, Pencil, Trash2 } from "lucide-react";

import { userService } from "@/api/services/userService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const roleColors = {
  ADMIN:
    "bg-red-100 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  AGENT:
    "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  USER: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
};

const statusColors = {
  ACTIVE:
    "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  PENDING:
    "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  BLOCKED:
    "bg-red-100 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  BANNED:
    "bg-red-100 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  REJECTED:
    "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Quản lý Người Dùng</h2>
          <p className="text-muted-foreground">
            Xem, tìm kiếm và quản lý tài khoản người dùng.
          </p>
        </div>

        <Button>Thêm Quản Trị Viên</Button>
      </div>

      <div className="flex justify-between">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-9"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Booking</TableHead>
              <TableHead className="w-16 text-center"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoading && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                    

                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        roleColors[user.role as keyof typeof roleColors] ??
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColors[
                          user.status as keyof typeof statusColors
                        ] ?? "bg-gray-100 text-gray-700"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
                  </TableCell>

                  <TableCell className="text-right">
                    {user.bookingsCount ?? 0}
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mx-auto">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          Xem chi tiết
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                          Chỉnh sửa
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center py-10" colSpan={6}>
                  {isLoading ? "Đang tải..." : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
