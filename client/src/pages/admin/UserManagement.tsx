import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { userService } from "@/api/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface AdminUser { id: string; email: string; role: string; status: string; createdAt: string; profile?: { fullName?: string | null; phoneNumber?: string | null; address?: string | null } | null }
const statusLabel: Record<string, string> = { ACTIVE: "Hoạt động", PENDING: "Chờ duyệt", INACTIVE: "Tạm ngưng", BANNED: "Đã khóa", REJECTED: "Từ chối" };

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  useEffect(() => { userService.getAllUsers().then((response) => setUsers(response.data.filter((user: AdminUser) => user.role === "USER"))).catch(() => toast.error("Không thể tải người dùng")).finally(() => setLoading(false)); }, []);
  const updateStatus = async (user: AdminUser, status: string) => { if (!window.confirm(`Chuyển ${user.email} sang ${statusLabel[status]}?`)) return; try { setUpdating(user.id); const response = await userService.updateStatus(user.id, status); setUsers((current) => current.map((item) => item.id === user.id ? response.data : item)); toast.success("Đã cập nhật trạng thái người dùng"); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể cập nhật người dùng"); } finally { setUpdating(null); } };
  const filtered = users.filter((user) => `${user.email} ${user.profile?.fullName || ""} ${user.profile?.phoneNumber || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Quản lý người dùng</h1><p className="mt-1 text-muted-foreground">Theo dõi và khóa/mở khóa tài khoản khách hàng.</p></div><div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Tìm tên, email hoặc số điện thoại" /></div><div className="overflow-hidden rounded-xl border bg-white"><Table><TableHeader><TableRow><TableHead>Người dùng</TableHead><TableHead>Liên hệ</TableHead><TableHead>Ngày tham gia</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{!loading && filtered.length ? filtered.map((user) => <TableRow key={user.id}><TableCell><div className="font-medium">{user.profile?.fullName || "Chưa cập nhật tên"}</div><div className="text-xs text-muted-foreground">{user.email}</div></TableCell><TableCell><div>{user.profile?.phoneNumber || "Chưa có SĐT"}</div><div className="text-xs text-muted-foreground">{user.profile?.address || "Chưa có địa chỉ"}</div></TableCell><TableCell>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</TableCell><TableCell><Badge variant={user.status === "BANNED" ? "destructive" : user.status === "ACTIVE" ? "default" : "secondary"}>{statusLabel[user.status] || user.status}</Badge></TableCell><TableCell className="text-right">{user.status === "BANNED" ? <Button size="sm" disabled={updating === user.id} onClick={() => void updateStatus(user, "ACTIVE")}>Mở khóa</Button> : <Button size="sm" variant="outline" className="text-destructive" disabled={updating === user.id} onClick={() => void updateStatus(user, "BANNED")}>Khóa tài khoản</Button>}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">{loading ? "Đang tải..." : "Không có người dùng phù hợp."}</TableCell></TableRow>}</TableBody></Table></div></div>;
}
