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
import { MoreHorizontal, Search, CheckCircle, XCircle, Trash2, EyeOff, Star } from "lucide-react";
import { format } from "date-fns";

const mockReviews = [
  {
    id: "REV-001",
    hotelName: "InterContinental Hanoi",
    customerName: "Nguyễn Văn A",
    rating: 5,
    content: "Phòng sạch sẽ, view đẹp, nhân viên thân thiện. Chắc chắn sẽ quay lại!",
    status: "APPROVED",
    createdAt: new Date("2023-11-20T10:30:00"),
  },
  {
    id: "REV-002",
    hotelName: "Boutique Hotel Sài Gòn",
    customerName: "Trần Thị B",
    rating: 2,
    content: "Dịch vụ kém, máy lạnh hỏng không ai sửa.",
    status: "PENDING",
    createdAt: new Date("2023-11-22T14:15:00"),
  },
  {
    id: "REV-003",
    hotelName: "Vinpearl Resort Nha Trang",
    customerName: "Spammer123",
    rating: 5,
    content: "CLICK VÀO ĐÂY ĐỂ NHẬN THƯỞNG 1 TỶ: http://spam-link.com",
    status: "SPAM",
    createdAt: new Date("2023-11-23T09:00:00"),
  },
];

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = mockReviews.filter(
    (review) =>
      review.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Kiểm duyệt Đánh giá
          </h2>
          <p className="text-muted-foreground mt-1">
            Quản lý, kiểm duyệt và xử lý các đánh giá vi phạm (spam/chửi thề).
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo nội dung, khách sạn, người dùng..."
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
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Khách sạn</TableHead>
              <TableHead className="w-[150px]">Người đánh giá</TableHead>
              <TableHead className="w-[100px]">Số sao</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">{review.id}</TableCell>
                  <TableCell className="font-medium">{review.hotelName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{review.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{format(review.createdAt, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                      <span className="font-bold">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2" title={review.content}>
                      {review.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    {review.status === "APPROVED" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã duyệt</Badge>}
                    {review.status === "PENDING" && <Badge className="bg-amber-500 hover:bg-amber-600">Chờ duyệt</Badge>}
                    {review.status === "SPAM" && <Badge variant="destructive">SPAM / Ẩn</Badge>}
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
                        
                        {review.status === "PENDING" && (
                          <>
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Duyệt đánh giá</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {review.status !== "SPAM" && (
                          <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                            <EyeOff className="mr-2 h-4 w-4" />
                            <span>Đánh dấu là SPAM (Ẩn)</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Xóa vĩnh viễn</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy đánh giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
