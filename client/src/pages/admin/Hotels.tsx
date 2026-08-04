import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  ImageOff,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { userService } from "@/api/services/userService";
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
import type { Hotel, HotelStatus } from "@/types";
import { toast } from "sonner";

interface HotelOwner {
  id: string;
  email: string;
  role: string;
  profile?: { fullName?: string | null; phoneNumber?: string | null } | null;
}

const statusConfig: Record<HotelStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Chờ duyệt", className: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  ACTIVE: { label: "Hoạt động", className: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  INACTIVE: { label: "Đã ẩn", className: "border-slate-200 bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  REJECTED: { label: "Đã từ chối", className: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
};

const propertyLabels: Record<string, string> = {
  HOTEL: "Khách sạn",
  RESORT: "Khu nghỉ dưỡng",
  VILLA: "Biệt thự",
  APARTMENT: "Căn hộ",
  HOMESTAY: "Homestay",
  GUESTHOUSE: "Nhà khách",
  MOTEL: "Nhà nghỉ",
  CAMPING: "Khu cắm trại",
  GLAMPING: "Glamping",
  CRUISE: "Du thuyền",
  ENTIRE_HOUSE: "Nhà nguyên căn",
};

const createdDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [owners, setOwners] = useState<HotelOwner[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HotelStatus | "ALL">("ALL");
  const [propertyType, setPropertyType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [statusAction, setStatusAction] = useState<{ hotel: Hotel; status: HotelStatus } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hotelResponse, userResponse] = await Promise.all([
        hotelService.getAdminHotels(),
        userService.getAllUsers(),
      ]);
      setHotels(hotelResponse.data.data);
      setOwners(userResponse.data.filter((user: HotelOwner) => user.role === "AGENT"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách chỗ nghỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const updateStatus = async () => {
    if (!statusAction) return;
    setUpdating(statusAction.hotel.id);
    try {
      const response = await hotelService.updateHotelStatus(statusAction.hotel.id, statusAction.status);
      setHotels((current) => current.map((hotel) => hotel.id === statusAction.hotel.id ? response.data : hotel));
      setSelectedHotel((current) => current?.id === statusAction.hotel.id ? response.data : current);
      toast.success(getActionCopy(statusAction.status).success);
      setStatusAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái chỗ nghỉ");
    } finally {
      setUpdating(null);
    }
  };

  const ownerById = new Map(owners.map((owner) => [owner.id, owner]));
  const propertyTypes = [...new Set(hotels.map((hotel) => hotel.propertyType))].sort();
  const filtered = hotels
    .filter((hotel) => {
      const owner = hotel.ownerId ? ownerById.get(hotel.ownerId) : undefined;
      const keyword = search.trim().toLowerCase();
      const searchable = `${hotel.name} ${hotel.city} ${hotel.address} ${hotel.slug} ${hotel.id} ${owner?.email || ""} ${owner?.profile?.fullName || ""}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (status === "ALL" || hotel.status === status)
        && (propertyType === "ALL" || hotel.propertyType === propertyType);
    })
    .sort((left, right) => {
      if (left.status === "PENDING" && right.status !== "PENDING") return -1;
      if (left.status !== "PENDING" && right.status === "PENDING") return 1;
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

  const pendingHotels = hotels.filter((hotel) => hotel.status === "PENDING").length;
  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const hiddenHotels = hotels.filter((hotel) => hotel.status === "INACTIVE").length;
  const rejectedHotels = hotels.filter((hotel) => hotel.status === "REJECTED").length;
  const selectedOwner = selectedHotel?.ownerId ? ownerById.get(selectedHotel.ownerId) : undefined;

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[26px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/50 to-blue-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-cyan-950/30 md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"><ShieldCheck className="h-4 w-4" />Property quality control</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý chỗ nghỉ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Kiểm duyệt thông tin, chất lượng nội dung và trạng thái hiển thị của toàn bộ chỗ nghỉ trên NestBooking.</p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới dữ liệu</Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock3} label="Chờ kiểm duyệt" value={pendingHotels} hint="Ưu tiên xử lý trước" tone="amber" />
        <StatCard icon={CheckCircle2} label="Đang hoạt động" value={activeHotels} hint={`${hotels.length ? Math.round(activeHotels / hotels.length * 100) : 0}% tổng chỗ nghỉ`} tone="sky" />
        <StatCard icon={EyeOff} label="Đang ẩn" value={hiddenHotels} hint="Không hiển thị công khai" tone="slate" />
        <StatCard icon={XCircle} label="Đã từ chối" value={rejectedHotels} hint="Hồ sơ chưa đạt yêu cầu" tone="red" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm chỗ nghỉ, thành phố, đối tác hoặc ID" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả loại hình</SelectItem>{propertyTypes.map((type) => <SelectItem key={type} value={type}>{propertyLabels[type] || type}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => setStatus(value as HotelStatus | "ALL")}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-44"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="PENDING">Chờ duyệt</SelectItem><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="INACTIVE">Đã ẩn</SelectItem><SelectItem value="REJECTED">Đã từ chối</SelectItem></SelectContent>
              </Select>
              <div className="hidden whitespace-nowrap text-sm text-muted-foreground 2xl:block">{filtered.length} kết quả</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1210px]">
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="pl-5">Chỗ nghỉ</TableHead><TableHead>Địa điểm</TableHead><TableHead>Đối tác</TableHead><TableHead>Nội dung</TableHead><TableHead className="w-[150px]">Loại phòng</TableHead><TableHead className="w-[145px] text-center">Trạng thái</TableHead><TableHead className="pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {!loading && filtered.length ? filtered.map((hotel) => {
                  const owner = hotel.ownerId ? ownerById.get(hotel.ownerId) : undefined;
                  const completeness = getCompleteness(hotel);
                  return (
                    <TableRow key={hotel.id} className={hotel.status === "PENDING" ? "bg-amber-50/35 hover:bg-amber-50/60 dark:bg-amber-950/10" : "hover:bg-cyan-50/30 dark:hover:bg-zinc-900"}>
                      <TableCell className="pl-5"><div className="flex items-center gap-3"><HotelThumbnail hotel={hotel} /><div className="min-w-0"><div className="max-w-60 truncate font-semibold text-slate-900 dark:text-white">{hotel.name}</div><div className="mt-1 flex items-center gap-2 text-xs"><span className="font-medium text-cyan-700 dark:text-cyan-400">{propertyLabels[hotel.propertyType] || hotel.propertyType}</span><span className="text-slate-300">•</span><span className="text-slate-400">ID: {hotel.id.slice(0, 6).toUpperCase()}</span></div></div></div></TableCell>
                      <TableCell><div className="flex max-w-52 items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><div className="font-medium text-slate-700 dark:text-zinc-200">{hotel.city}</div><div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{hotel.address}</div></div></div></TableCell>
                      <TableCell><div className="max-w-48"><div className="truncate font-medium text-slate-700 dark:text-zinc-200">{owner?.profile?.fullName || "Chưa có tên đối tác"}</div><div className="mt-1 truncate text-xs text-muted-foreground">{owner?.email || hotel.ownerId || "Không xác định"}</div></div></TableCell>
                      <TableCell><ProfileProgress percent={completeness} /></TableCell>
                      <TableCell><div className="inline-flex min-w-[125px] items-center gap-2.5 whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 dark:border-blue-950 dark:bg-blue-950/30"><BedDouble className="h-4 w-4 shrink-0 text-blue-600" /><span className="font-bold text-slate-800 dark:text-zinc-100">{hotel.roomTypes?.length || 0}</span><span className="text-xs text-slate-500 dark:text-zinc-400">loại phòng</span></div></TableCell>
                      <TableCell className="text-center"><div className="flex min-w-[125px] justify-center"><StatusBadge status={hotel.status as HotelStatus} /></div></TableCell>
                      <TableCell className="pr-5"><HotelActions hotel={hotel} updating={updating} onView={setSelectedHotel} onAction={(nextStatus) => setStatusAction({ hotel, status: nextStatus })} /></TableCell>
                    </TableRow>
                  );
                }) : <TableRow><TableCell colSpan={7} className="h-44 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải danh sách chỗ nghỉ...</span> : <span><Building2 className="mx-auto mb-2 h-8 w-8 text-slate-300" />Không có chỗ nghỉ phù hợp với bộ lọc.</span>}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedHotel)} onOpenChange={(open) => { if (!open) setSelectedHotel(null); }}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl p-0">
          {selectedHotel && <><div className="relative h-52 overflow-hidden bg-slate-900 sm:h-60">{getHotelImage(selectedHotel) ? <img src={getHotelImage(selectedHotel)} alt={selectedHotel.name} className="h-full w-full object-cover opacity-80" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-800 to-blue-950"><Building2 className="h-16 w-16 text-white/30" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-cyan-500 text-white">{propertyLabels[selectedHotel.propertyType] || selectedHotel.propertyType}</Badge><StatusBadge status={selectedHotel.status as HotelStatus} /></div><DialogTitle className="text-2xl text-white">{selectedHotel.name}</DialogTitle><DialogDescription className="mt-1 flex items-center gap-1.5 text-slate-200"><MapPin className="h-4 w-4" />{selectedHotel.address}, {selectedHotel.city}</DialogDescription></div></div><div className="space-y-6 p-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><DetailCard icon={UserRound} label="Đối tác" value={selectedOwner?.profile?.fullName || selectedOwner?.email || "Không xác định"} /><DetailCard icon={BedDouble} label="Loại phòng" value={`${selectedHotel.roomTypes?.length || 0} loại phòng`} /><DetailCard icon={Star} label="Đánh giá" value={selectedHotel.rating ? `${selectedHotel.rating.toFixed(1)} / 5` : "Chưa có đánh giá"} /><DetailCard icon={CalendarDays} label="Ngày tạo" value={selectedHotel.createdAt ? createdDate.format(new Date(selectedHotel.createdAt)) : "Không xác định"} /></div><div><h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Mô tả chỗ nghỉ</h3><p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{selectedHotel.description || "Đối tác chưa cung cấp mô tả cho chỗ nghỉ này."}</p></div><div className="grid gap-4 sm:grid-cols-2"><InfoBlock label="Liên hệ chỗ nghỉ" lines={[selectedHotel.phone || "Chưa có số điện thoại", selectedHotel.email || "Chưa có email"]} /><InfoBlock label="Vận hành" lines={[`Nhận phòng: ${selectedHotel.checkInTime || "Chưa cập nhật"}`, `Trả phòng: ${selectedHotel.checkOutTime || "Chưa cập nhật"}`]} /></div>{selectedHotel.amenities?.length ? <div><h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Tiện nghi</h3><div className="flex flex-wrap gap-2">{selectedHotel.amenities.map((amenity) => <Badge key={amenity} variant="secondary" className="rounded-lg px-2.5 py-1">{amenity}</Badge>)}</div></div> : null}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between dark:border-zinc-800"><div>{selectedHotel.status === "ACTIVE" && <Button variant="outline" asChild className="gap-2 rounded-xl"><Link to={`/hotel/${selectedHotel.id}`}><Eye className="h-4 w-4" />Xem trang công khai</Link></Button>}</div><div className="flex flex-wrap justify-end gap-2"><ModalActions hotel={selectedHotel} updating={updating} onAction={(nextStatus) => setStatusAction({ hotel: selectedHotel, status: nextStatus })} /></div></div></div></>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open && !updating) setStatusAction(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          {statusAction && <><DialogHeader><div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${getActionCopy(statusAction.status).iconClass}`}>{getActionIcon(statusAction.status)}</div><DialogTitle>{getActionCopy(statusAction.status).title}</DialogTitle><DialogDescription>{getActionCopy(statusAction.status).description(statusAction.hotel.name)}</DialogDescription></DialogHeader><DialogFooter className="mt-3 gap-2"><Button variant="outline" onClick={() => setStatusAction(null)} disabled={Boolean(updating)}>Hủy</Button><Button variant={statusAction.status === "REJECTED" ? "destructive" : "default"} onClick={() => void updateStatus()} disabled={Boolean(updating)}>{updating ? "Đang cập nhật..." : getActionCopy(statusAction.status).confirm}</Button></DialogFooter></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HotelActions({ hotel, updating, onView, onAction }: { hotel: Hotel; updating: string | null; onView: (hotel: Hotel) => void; onAction: (status: HotelStatus) => void }) {
  return <div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg" onClick={() => onView(hotel)}><Eye className="h-3.5 w-3.5" />Chi tiết</Button>{hotel.status === "PENDING" && <><Button size="sm" className="h-8 gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700" disabled={updating === hotel.id} onClick={() => onAction("ACTIVE")}><CheckCircle2 className="h-3.5 w-3.5" />Duyệt</Button><Button size="sm" variant="destructive" className="h-8 gap-1.5 rounded-lg" disabled={updating === hotel.id} onClick={() => onAction("REJECTED")}><XCircle className="h-3.5 w-3.5" />Từ chối</Button></>}{hotel.status === "ACTIVE" && <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg" disabled={updating === hotel.id} onClick={() => onAction("INACTIVE")}><EyeOff className="h-3.5 w-3.5" />Ẩn</Button>}{["INACTIVE", "REJECTED"].includes(hotel.status) && <Button size="sm" className="h-8 gap-1.5 rounded-lg" disabled={updating === hotel.id} onClick={() => onAction("ACTIVE")}><CheckCircle2 className="h-3.5 w-3.5" />Kích hoạt</Button>}</div>;
}

function ModalActions({ hotel, updating, onAction }: { hotel: Hotel; updating: string | null; onAction: (status: HotelStatus) => void }) {
  if (hotel.status === "PENDING") return <><Button variant="destructive" disabled={updating === hotel.id} onClick={() => onAction("REJECTED")}><XCircle className="mr-2 h-4 w-4" />Từ chối</Button><Button className="bg-sky-600 hover:bg-sky-700" disabled={updating === hotel.id} onClick={() => onAction("ACTIVE")}><CheckCircle2 className="mr-2 h-4 w-4" />Phê duyệt</Button></>;
  if (hotel.status === "ACTIVE") return <Button variant="outline" disabled={updating === hotel.id} onClick={() => onAction("INACTIVE")}><EyeOff className="mr-2 h-4 w-4" />Ẩn chỗ nghỉ</Button>;
  return <Button disabled={updating === hotel.id} onClick={() => onAction("ACTIVE")}><CheckCircle2 className="mr-2 h-4 w-4" />Kích hoạt lại</Button>;
}

function HotelThumbnail({ hotel }: { hotel: Hotel }) {
  const image = getHotelImage(hotel);
  return <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-slate-400" />}</div>;
}

function getHotelImage(hotel: Hotel) {
  return hotel.thumbnail || hotel.images?.[0]?.imageUrl || "";
}

function StatusBadge({ status }: { status: HotelStatus }) {
  const config = statusConfig[status];
  return <Badge variant="outline" className={config.className}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dot}`} />{config.label}</Badge>;
}

function ProfileProgress({ percent }: { percent: number }) {
  return <div className="w-32"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Hoàn thiện</span><span className="font-semibold">{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${percent >= 85 ? "bg-sky-500" : percent >= 60 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${percent}%` }} /></div></div>;
}

function getCompleteness(hotel: Hotel) {
  const fields = [hotel.description, getHotelImage(hotel), hotel.phone, hotel.email, hotel.roomTypes?.length, hotel.amenities?.length];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof Clock3; label: string; value: number; hint: string; tone: "amber" | "sky" | "slate" | "red" }) {
  const tones = { amber: "bg-amber-50 text-amber-700", sky: "bg-sky-50 text-sky-700", slate: "bg-slate-100 text-slate-700", red: "bg-red-50 text-red-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function DetailCard({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900"><Icon className="mb-2 h-4 w-4 text-cyan-600" /><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 line-clamp-2 text-sm font-medium text-slate-800 dark:text-zinc-100">{value}</div></div>;
}

function InfoBlock({ label, lines }: { label: string; lines: string[] }) {
  return <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>{lines.map((line) => <div key={line} className="mt-1 break-all text-sm text-slate-700 dark:text-zinc-300">{line}</div>)}</div>;
}

function getActionIcon(status: HotelStatus) {
  if (status === "REJECTED") return <XCircle className="h-6 w-6" />;
  if (status === "INACTIVE") return <EyeOff className="h-6 w-6" />;
  return <CheckCircle2 className="h-6 w-6" />;
}

function getActionCopy(status: HotelStatus) {
  if (status === "REJECTED") return { title: "Từ chối chỗ nghỉ?", confirm: "Xác nhận từ chối", success: "Đã từ chối chỗ nghỉ", iconClass: "bg-red-100 text-red-600", description: (name: string) => `${name} sẽ không được hiển thị công khai và được đánh dấu là chưa đạt yêu cầu.` };
  if (status === "INACTIVE") return { title: "Ẩn chỗ nghỉ?", confirm: "Xác nhận ẩn", success: "Đã ẩn chỗ nghỉ", iconClass: "bg-slate-100 text-slate-600", description: (name: string) => `${name} sẽ bị gỡ khỏi kết quả tìm kiếm và trang công khai cho đến khi được kích hoạt lại.` };
  return { title: "Kích hoạt chỗ nghỉ?", confirm: "Xác nhận kích hoạt", success: "Đã kích hoạt chỗ nghỉ", iconClass: "bg-sky-100 text-sky-600", description: (name: string) => `${name} sẽ được phép hiển thị công khai và nhận đặt phòng trên NestBooking.` };
}
