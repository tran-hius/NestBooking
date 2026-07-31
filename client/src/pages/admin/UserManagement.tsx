import { useEffect, useState } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { userService } from "@/api/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  profile?: {
    fullName?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    avatarUrl?: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Chờ kích hoạt", className: "border-amber-200 bg-amber-50 text-amber-700" },
  INACTIVE: { label: "Tạm ngưng", className: "border-slate-200 bg-slate-100 text-slate-700" },
  BANNED: { label: "Đã khóa", className: "border-red-200 bg-red-50 text-red-700" },
  REJECTED: { label: "Từ chối", className: "border-orange-200 bg-orange-50 text-orange-700" },
};

const joinedDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [statusAction, setStatusAction] = useState<{ user: AdminUser; status: "ACTIVE" | "BANNED" } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data.filter((user: AdminUser) => user.role === "USER"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const updateStatus = async () => {
    if (!statusAction) return;
    setUpdating(statusAction.user.id);
    try {
      const response = await userService.updateStatus(statusAction.user.id, statusAction.status);
      setUsers((current) => current.map((item) => item.id === statusAction.user.id ? response.data : item));
      toast.success(statusAction.status === "ACTIVE" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      setStatusAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật người dùng");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || `${user.email} ${user.profile?.fullName || ""} ${user.profile?.phoneNumber || ""} ${user.id}`.toLowerCase().includes(keyword);
    return matchesSearch && (status === "ALL" || user.status === status);
  });

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const bannedUsers = users.filter((user) => user.status === "BANNED").length;
  const completeProfiles = users.filter((user) => user.profile?.fullName && user.profile?.phoneNumber).length;
  const newUsers = users.filter((user) => Date.now() - new Date(user.createdAt).getTime() <= 30 * 86400000).length;

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30 md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950 dark:text-blue-300"><UsersRound className="h-4 w-4" />Customer accounts</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý người dùng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Theo dõi hồ sơ khách hàng, tình trạng truy cập và xử lý các tài khoản cần khóa hoặc kích hoạt lại.</p>
          </div>
          <Button variant="outline" onClick={() => void loadUsers()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới dữ liệu</Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Tổng khách hàng" value={users.length} hint="Tài khoản role USER" tone="blue" />
        <StatCard icon={UserRoundCheck} label="Đang hoạt động" value={activeUsers} hint={`${users.length ? Math.round(activeUsers / users.length * 100) : 0}% tổng tài khoản`} tone="emerald" />
        <StatCard icon={Ban} label="Đã khóa" value={bannedUsers} hint="Không thể đăng nhập" tone="red" />
        <StatCard icon={ShieldCheck} label="Hồ sơ đầy đủ" value={completeProfiles} hint={`${newUsers} người dùng mới trong 30 ngày`} tone="violet" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm tên, email, số điện thoại hoặc ID" />
            </div>
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="BANNED">Đã khóa</SelectItem><SelectItem value="PENDING">Chờ kích hoạt</SelectItem><SelectItem value="INACTIVE">Tạm ngưng</SelectItem></SelectContent>
              </Select>
              <div className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">{filtered.length} kết quả</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[940px]">
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="pl-5">Khách hàng</TableHead><TableHead>Liên hệ</TableHead><TableHead>Hồ sơ</TableHead><TableHead>Ngày tham gia</TableHead><TableHead>Trạng thái</TableHead><TableHead className="pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {!loading && filtered.length ? filtered.map((user) => {
                  const profileFields = [user.profile?.fullName, user.profile?.phoneNumber, user.profile?.address].filter(Boolean).length;
                  const profilePercent = Math.round(profileFields / 3 * 100);
                  return <TableRow key={user.id} className="group hover:bg-blue-50/30 dark:hover:bg-zinc-900"><TableCell className="pl-5"><div className="flex items-center gap-3"><Avatar className="h-11 w-11 border border-slate-200 shadow-sm"><AvatarImage src={user.profile?.avatarUrl || ""} /><AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">{getInitials(user)}</AvatarFallback></Avatar><div className="min-w-0"><div className="max-w-56 truncate font-semibold text-slate-900 dark:text-white">{user.profile?.fullName || "Chưa cập nhật tên"}</div><div className="mt-0.5 text-xs text-slate-400">ID: {user.id.slice(0, 8).toUpperCase()}</div></div></div></TableCell><TableCell><div className="font-medium text-slate-700 dark:text-zinc-200">{user.email}</div><div className="mt-1 text-xs text-muted-foreground">{user.profile?.phoneNumber || "Chưa có số điện thoại"}</div></TableCell><TableCell><div className="w-32"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Hoàn thiện</span><span className="font-semibold">{profilePercent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${profilePercent === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${profilePercent}%` }} /></div></div></TableCell><TableCell><div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300"><CalendarDays className="h-4 w-4 text-slate-400" />{joinedDate.format(new Date(user.createdAt))}</div></TableCell><TableCell><Badge variant="outline" className={statusConfig[user.status]?.className || "bg-slate-100 text-slate-700"}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : user.status === "BANNED" ? "bg-red-500" : "bg-amber-500"}`} />{statusConfig[user.status]?.label || user.status}</Badge></TableCell><TableCell className="pr-5"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)} className="h-9 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Eye className="mr-1.5 h-4 w-4" />Chi tiết</Button>{user.status === "BANNED" ? <Button size="sm" disabled={updating === user.id} onClick={() => setStatusAction({ user, status: "ACTIVE" })} className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1.5 h-4 w-4" />Mở khóa</Button> : <Button size="sm" variant="outline" disabled={updating === user.id} onClick={() => setStatusAction({ user, status: "BANNED" })} className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><Ban className="mr-1.5 h-4 w-4" />Khóa</Button>}</div></TableCell></TableRow>;
                }) : <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải người dùng...</span> : "Không có người dùng phù hợp với bộ lọc."}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden">
          {selectedUser && <><div className="bg-gradient-to-r from-[#062a5e] to-[#1379c8] p-6 text-white"><div className="flex items-center gap-4"><Avatar className="h-16 w-16 border-2 border-white/30"><AvatarImage src={selectedUser.profile?.avatarUrl || ""} /><AvatarFallback className="bg-white/15 text-xl font-bold text-white">{getInitials(selectedUser)}</AvatarFallback></Avatar><div className="min-w-0"><DialogTitle className="truncate text-xl text-white">{selectedUser.profile?.fullName || "Chưa cập nhật tên"}</DialogTitle><DialogDescription className="mt-1 truncate text-blue-100">{selectedUser.email}</DialogDescription><Badge variant="outline" className="mt-3 border-white/20 bg-white/10 text-white">{statusConfig[selectedUser.status]?.label || selectedUser.status}</Badge></div></div></div><div className="grid gap-4 p-6 sm:grid-cols-2"><UserDetail label="Mã người dùng" value={selectedUser.id} /><UserDetail label="Số điện thoại" value={selectedUser.profile?.phoneNumber || "Chưa cập nhật"} /><UserDetail label="Ngày tham gia" value={joinedDate.format(new Date(selectedUser.createdAt))} /><UserDetail label="Vai trò" value="Khách hàng" /><div className="sm:col-span-2"><UserDetail label="Địa chỉ" value={selectedUser.profile?.address || "Chưa cập nhật địa chỉ"} /></div></div></>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open && !updating) setStatusAction(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${statusAction?.status === "BANNED" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>{statusAction?.status === "BANNED" ? <Ban className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}</div><DialogTitle>{statusAction?.status === "BANNED" ? "Khóa tài khoản người dùng?" : "Mở khóa tài khoản?"}</DialogTitle><DialogDescription>{statusAction?.status === "BANNED" ? `${statusAction.user.email} sẽ không thể đăng nhập cho đến khi được mở khóa.` : `${statusAction?.user.email} sẽ có thể đăng nhập và sử dụng NestBooking trở lại.`}</DialogDescription></DialogHeader>
          <DialogFooter className="mt-3 gap-2"><Button variant="outline" onClick={() => setStatusAction(null)} disabled={Boolean(updating)}>Hủy</Button><Button variant={statusAction?.status === "BANNED" ? "destructive" : "default"} onClick={() => void updateStatus()} disabled={Boolean(updating)}>{updating ? "Đang cập nhật..." : statusAction?.status === "BANNED" ? "Xác nhận khóa" : "Xác nhận mở khóa"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getInitials(user: AdminUser) {
  const name = user.profile?.fullName?.trim();
  if (!name) return user.email.charAt(0).toUpperCase();
  return name.split(/\s+/).slice(-2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof UsersRound; label: string; value: number; hint: string; tone: "blue" | "emerald" | "red" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700", violet: "bg-violet-50 text-violet-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function UserDetail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-zinc-100">{value}</div></div>;
}
