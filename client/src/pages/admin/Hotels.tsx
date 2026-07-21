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
import { MoreHorizontal, Search, Eye, MapPin, CheckCircle, XCircle, EyeOff, Star } from "lucide-react";
import { format } from "date-fns";

const mockHotels = [
  {
    id: "HTL-1001",
    name: "InterContinental Hanoi",
    agentName: "Tập đoàn IHG",
    location: "Hà Nội",
    status: "ACTIVE",
    rating: 4.9,
    rooms: 120,
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "HTL-1002",
    name: "Boutique Hotel Sài Gòn",
    agentName: "Công ty Du lịch SG",
    location: "Hồ Chí Minh",
    status: "PENDING",
    rating: 0,
    rooms: 45,
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "HTL-1003",
    name: "Vinpearl Resort Nha Trang",
    agentName: "Vinpearl Group",
    location: "Nha Trang",
    status: "ACTIVE",
    rating: 4.8,
    rooms: 350,
    createdAt: new Date("2022-05-10"),
  },
  {
    id: "HTL-1004",
    name: "Đà Lạt Mộng Mơ Homestay",
    agentName: "Cá nhân - Nguyễn Văn A",
    location: "Đà Lạt",
    status: "HIDDEN",
    rating: 4.2,
    rooms: 8,
    createdAt: new Date("2023-08-05"),
  },
];

export default function Hotels() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHotels = mockHotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Quản lý Khách sạn
          </h2>
          <p className="text-muted-foreground mt-1">
            Xem danh sách, kiểm duyệt và quản lý trạng thái hiển thị của các khách sạn.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên khách sạn, địa điểm, ID..."
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
              <TableHead>Tên Khách sạn</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <TableRow key={hotel.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{hotel.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{hotel.name}</span>
                      <span className="text-xs text-muted-foreground">Đối tác: {hotel.agentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                      {hotel.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-amber-500 font-medium">
                      <Star className="h-4 w-4 mr-1 fill-amber-500" />
                      {hotel.rating > 0 ? hotel.rating : "Chưa có"}
                    </div>
                  </TableCell>
                  <TableCell>{hotel.rooms}</TableCell>
                  <TableCell>
                    {hotel.status === "ACTIVE" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Hoạt động</Badge>}
                    {hotel.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Chờ duyệt</Badge>}
                    {hotel.status === "HIDDEN" && <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Bị ẩn</Badge>}
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
                          <span>Xem chi tiết & Ảnh</span>
                        </DropdownMenuItem>
                        
                        {hotel.status === "PENDING" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Duyệt khách sạn</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Từ chối</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {hotel.status === "ACTIVE" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                              <EyeOff className="mr-2 h-4 w-4" />
                              <span>Ẩn khỏi hệ thống</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {hotel.status === "HIDDEN" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Hiển thị lại</span>
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
                  Không tìm thấy khách sạn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
