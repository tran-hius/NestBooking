import { useEffect, useState } from "react";
import {
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
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
import type { Hotel } from "@/types";
import { toast } from "sonner";

interface AgentUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile?: {
    fullName?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    avatarUrl?: string | null;
  } | null;
}

type AgentStatus = "ACTIVE" | "INACTIVE" | "BANNED";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  ACTIVE: { label: "Đã kích hoạt", className: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  INACTIVE: { label: "Tạm ngưng", className: "border-slate-200 bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  BANNED: { label: "Đã khóa", className: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
};

const joinedDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function AgentManagement() {
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentUser | null>(null);
  const [statusAction, setStatusAction] = useState<{ agent: AgentUser; status: AgentStatus } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userResponse, hotelResponse] = await Promise.all([
        userService.getAllUsers(),
        hotelService.getAdminHotels(),
      ]);
      setAgents(userResponse.data.filter((user: AgentUser) => user.role === "AGENT"));
      setHotels(hotelResponse.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu đối tác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const updateStatus = async () => {
    if (!statusAction) return;
    setUpdating(statusAction.agent.id);
    try {
      const response = await userService.updateStatus(statusAction.agent.id, statusAction.status);
      setAgents((current) => current.map((item) => item.id === statusAction.agent.id ? response.data : item));
      toast.success(getActionCopy(statusAction.status).success);
      setStatusAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật đối tác");
    } finally {
      setUpdating(null);
    }
  };

  const hotelsByOwner = new Map<string, Hotel[]>();
  hotels.forEach((hotel) => {
    if (!hotel.ownerId) return;
    hotelsByOwner.set(hotel.ownerId, [...(hotelsByOwner.get(hotel.ownerId) || []), hotel]);
  });

  const filtered = agents
    .filter((agent) => {
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || `${agent.email} ${agent.profile?.fullName || ""} ${agent.profile?.phoneNumber || ""} ${agent.profile?.address || ""} ${agent.id}`.toLowerCase().includes(keyword);
      return matchesSearch && (status === "ALL" || agent.status === status);
    })
    .sort((left, right) => {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  const activeAgents = agents.filter((agent) => agent.status === "ACTIVE").length;
  const restrictedAgents = agents.filter((agent) => ["INACTIVE", "BANNED"].includes(agent.status)).length;
  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const selectedHotels = selectedAgent ? hotelsByOwner.get(selectedAgent.id) || [] : [];

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/50 to-blue-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-violet-950/30 md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:bg-violet-950 dark:text-violet-300"><ShieldCheck className="h-4 w-4" />Partner verification</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Duyệt đối tác</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Kiểm tra thông tin nhà cung cấp, theo dõi danh mục chỗ nghỉ và quyết định quyền kinh doanh trên NestBooking.</p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới dữ liệu</Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={UserRoundCheck} label="Đã kích hoạt" value={activeAgents} hint={`${agents.length ? Math.round(activeAgents / agents.length * 100) : 0}% tổng đối tác`} tone="sky" />
        <StatCard icon={Ban} label="Bị hạn chế" value={restrictedAgents} hint="Khóa hoặc tạm ngưng" tone="red" />
        <StatCard icon={Building2} label="Chỗ nghỉ hoạt động" value={activeHotels} hint={`${hotels.length} chỗ nghỉ toàn hệ thống`} tone="violet" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm tên, email, số điện thoại, địa chỉ hoặc ID" />
            </div>
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="ACTIVE">Đã kích hoạt</SelectItem><SelectItem value="INACTIVE">Tạm ngưng</SelectItem><SelectItem value="BANNED">Đã khóa</SelectItem></SelectContent>
              </Select>
              <div className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">{filtered.length} kết quả</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1040px]">
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="pl-5">Đối tác</TableHead><TableHead>Liên hệ</TableHead><TableHead>Hồ sơ</TableHead><TableHead>Chỗ nghỉ</TableHead><TableHead>Đăng ký</TableHead><TableHead>Trạng thái</TableHead><TableHead className="pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {!loading && filtered.length ? filtered.map((agent) => {
                  const ownedHotels = hotelsByOwner.get(agent.id) || [];
                  const profilePercent = getProfilePercent(agent);
                  return (
                    <TableRow key={agent.id} className="group hover:bg-violet-50/30 dark:hover:bg-zinc-900">
                      <TableCell className="pl-5"><div className="flex items-center gap-3"><Avatar className="h-11 w-11 border border-slate-200 shadow-sm"><AvatarImage src={agent.profile?.avatarUrl || ""} /><AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-500 font-bold text-white">{getInitials(agent)}</AvatarFallback></Avatar><div className="min-w-0"><div className="max-w-52 truncate font-semibold text-slate-900 dark:text-white">{agent.profile?.fullName || "Chưa cập nhật tên"}</div><div className="mt-0.5 text-xs text-slate-400">ID: {agent.id.slice(0, 8).toUpperCase()}</div></div></div></TableCell>
                      <TableCell><div className="max-w-56 truncate font-medium text-slate-700 dark:text-zinc-200">{agent.email}</div><div className="mt-1 text-xs text-muted-foreground">{agent.profile?.phoneNumber || "Chưa có số điện thoại"}</div></TableCell>
                      <TableCell><ProfileProgress percent={profilePercent} /></TableCell>
                      <TableCell><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950"><Store className="h-4 w-4" /></div><div><div className="font-semibold text-slate-800 dark:text-zinc-100">{ownedHotels.length}</div><div className="text-xs text-muted-foreground">{ownedHotels.filter((hotel) => hotel.status === "ACTIVE").length} hoạt động</div></div></div></TableCell>
                      <TableCell><div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300"><CalendarDays className="h-4 w-4 text-slate-400" />{joinedDate.format(new Date(agent.createdAt))}</div></TableCell>
                      <TableCell><StatusBadge status={agent.status} /></TableCell>
                      <TableCell className="pr-5"><AgentActions agent={agent} updating={updating} onView={setSelectedAgent} onAction={(nextStatus) => setStatusAction({ agent, status: nextStatus })} /></TableCell>
                    </TableRow>
                  );
                }) : <TableRow><TableCell colSpan={7} className="h-40 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải hồ sơ đối tác...</span> : "Không có đối tác phù hợp với bộ lọc."}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedAgent)} onOpenChange={(open) => { if (!open) setSelectedAgent(null); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl p-0">
          {selectedAgent && <><div className="bg-gradient-to-r from-[#2e1065] via-[#5b21b6] to-[#2563eb] p-6 text-white"><div className="flex items-center gap-4"><Avatar className="h-16 w-16 border-2 border-white/30"><AvatarImage src={selectedAgent.profile?.avatarUrl || ""} /><AvatarFallback className="bg-white/15 text-xl font-bold text-white">{getInitials(selectedAgent)}</AvatarFallback></Avatar><div className="min-w-0"><DialogTitle className="truncate text-xl text-white">{selectedAgent.profile?.fullName || "Chưa cập nhật tên"}</DialogTitle><DialogDescription className="mt-1 truncate text-violet-100">{selectedAgent.email}</DialogDescription><Badge variant="outline" className="mt-3 border-white/20 bg-white/10 text-white">{statusConfig[selectedAgent.status]?.label || selectedAgent.status}</Badge></div></div></div><div className="space-y-5 p-6"><div className="grid gap-3 sm:grid-cols-2"><AgentDetail label="Mã đối tác" value={selectedAgent.id} /><AgentDetail label="Số điện thoại" value={selectedAgent.profile?.phoneNumber || "Chưa cập nhật"} /><AgentDetail label="Ngày đăng ký" value={joinedDate.format(new Date(selectedAgent.createdAt))} /><AgentDetail label="Mức hoàn thiện" value={`${getProfilePercent(selectedAgent)}% hồ sơ cơ bản`} /><div className="sm:col-span-2"><AgentDetail label="Địa chỉ" value={selectedAgent.profile?.address || "Chưa cập nhật địa chỉ"} /></div></div><div><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-900 dark:text-white">Chỗ nghỉ sở hữu</h3><Badge variant="secondary">{selectedHotels.length} chỗ nghỉ</Badge></div>{selectedHotels.length ? <div className="space-y-2">{selectedHotels.map((hotel) => <div key={hotel.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-zinc-800"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950"><Building2 className="h-5 w-5" /></div><div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">{hotel.name}</div><div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{hotel.city}</div></div></div><HotelStatus status={hotel.status} /></div>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 py-7 text-center text-sm text-muted-foreground dark:border-zinc-800">Đối tác chưa tạo chỗ nghỉ nào.</div>}</div></div></>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open && !updating) setStatusAction(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          {statusAction && <><DialogHeader><div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${getActionCopy(statusAction.status).iconClass}`}>{getActionIcon(statusAction.status)}</div><DialogTitle>{getActionCopy(statusAction.status).title}</DialogTitle><DialogDescription>{getActionCopy(statusAction.status).description(statusAction.agent.email)}</DialogDescription></DialogHeader><DialogFooter className="mt-3 gap-2"><Button variant="outline" onClick={() => setStatusAction(null)} disabled={Boolean(updating)}>Hủy</Button><Button variant={["BANNED", "REJECTED"].includes(statusAction.status) ? "destructive" : "default"} onClick={() => void updateStatus()} disabled={Boolean(updating)}>{updating ? "Đang cập nhật..." : getActionCopy(statusAction.status).confirm}</Button></DialogFooter></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentActions({ agent, updating, onView, onAction }: { agent: AgentUser; updating: string | null; onView: (agent: AgentUser) => void; onAction: (status: AgentStatus) => void }) {
  return <div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg" onClick={() => onView(agent)}><Eye className="h-3.5 w-3.5" />Chi tiết</Button>{agent.status === "ACTIVE" && <Button size="sm" variant="destructive" className="h-8 gap-1.5 rounded-lg" disabled={updating === agent.id} onClick={() => onAction("BANNED")}><Ban className="h-3.5 w-3.5" />Khóa</Button>}{["BANNED", "INACTIVE"].includes(agent.status) && <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={updating === agent.id} onClick={() => onAction("ACTIVE")}><CheckCircle2 className="h-3.5 w-3.5" />Kích hoạt</Button>}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status];
  return <Badge variant="outline" className={config?.className || "bg-slate-100 text-slate-700"}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config?.dot || "bg-slate-500"}`} />{config?.label || status}</Badge>;
}

function HotelStatus({ status }: { status: string }) {
  const labels: Record<string, string> = { ACTIVE: "Hoạt động", INACTIVE: "Tạm ngưng" };
  const classes: Record<string, string> = { ACTIVE: "bg-sky-50 text-sky-700", INACTIVE: "bg-slate-100 text-slate-700" };
  return <Badge variant="outline" className={classes[status] || "bg-slate-100 text-slate-700"}>{labels[status] || status}</Badge>;
}

function ProfileProgress({ percent }: { percent: number }) {
  return <div className="w-32"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Hoàn thiện</span><span className="font-semibold">{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${percent === 100 ? "bg-sky-500" : percent >= 67 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${percent}%` }} /></div></div>;
}

function getProfilePercent(agent: AgentUser) {
  return Math.round([agent.profile?.fullName, agent.profile?.phoneNumber, agent.profile?.address].filter(Boolean).length / 3 * 100);
}

function getInitials(agent: AgentUser) {
  const name = agent.profile?.fullName?.trim();
  if (!name) return agent.email.charAt(0).toUpperCase();
  return name.split(/\s+/).slice(-2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof Clock3; label: string; value: number; hint: string; tone: "amber" | "sky" | "red" | "violet" }) {
  const tones = { amber: "bg-amber-50 text-amber-700", sky: "bg-sky-50 text-sky-700", red: "bg-red-50 text-red-700", violet: "bg-violet-50 text-violet-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function AgentDetail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-zinc-100">{value}</div></div>;
}

function getActionIcon(status: AgentStatus) {
  if (status === "BANNED") return <Ban className="h-6 w-6" />;
  return <CheckCircle2 className="h-6 w-6" />;
}

function getActionCopy(status: AgentStatus) {
  if (status === "BANNED") return { title: "Khóa tài khoản đối tác?", confirm: "Xác nhận khóa", success: "Đã khóa tài khoản đối tác", iconClass: "bg-red-100 text-red-600", description: (email: string) => `${email} sẽ không thể đăng nhập hoặc quản lý chỗ nghỉ cho đến khi được kích hoạt lại.` };
  return { title: "Kích hoạt tài khoản đối tác?", confirm: "Xác nhận kích hoạt", success: "Đã kích hoạt tài khoản đối tác", iconClass: "bg-sky-100 text-sky-600", description: (email: string) => `${email} sẽ có thể đăng nhập và sử dụng các chức năng quản lý chỗ nghỉ.` };
}
