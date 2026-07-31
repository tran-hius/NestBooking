import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  Clock3,
  DoorOpen,
  ImageOff,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Hotel, HotelStatus } from "@/types";
import { toast } from "sonner";

const statusConfig: Record<HotelStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Chờ duyệt", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300", dot: "bg-amber-500" },
  ACTIVE: { label: "Đang hoạt động", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  INACTIVE: { label: "Tạm ngưng", className: "border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", dot: "bg-slate-500" },
  REJECTED: { label: "Bị từ chối", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300", dot: "bg-red-500" },
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

export default function AgentHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HotelStatus | "ALL">("ALL");
  const [propertyType, setPropertyType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelService.getMyHotels();
      setHotels(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách chỗ nghỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadHotels(); }, []);

  const removeHotel = async (hotel: Hotel) => {
    if (!window.confirm(`Xóa chỗ nghỉ ${hotel.name}? Thao tác này không thể hoàn tác.`)) return;
    setDeletingId(hotel.id);
    try {
      await hotelService.deleteHotel(hotel.id);
      setHotels((current) => current.filter((item) => item.id !== hotel.id));
      toast.success("Đã xóa chỗ nghỉ");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa chỗ nghỉ");
    } finally {
      setDeletingId(null);
    }
  };

  const propertyTypes = [...new Set(hotels.map((hotel) => hotel.propertyType))].sort();
  const filtered = hotels
    .filter((hotel) => {
      const keyword = search.trim().toLowerCase();
      const searchable = `${hotel.name} ${hotel.city} ${hotel.address} ${hotel.slug}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (status === "ALL" || hotel.status === status)
        && (propertyType === "ALL" || hotel.propertyType === propertyType);
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  const activeHotels = hotels.filter((hotel) => hotel.status === "ACTIVE").length;
  const pendingHotels = hotels.filter((hotel) => hotel.status === "PENDING").length;
  const attentionHotels = hotels.filter((hotel) => ["INACTIVE", "REJECTED"].includes(hotel.status)).length;
  const totalRoomTypes = hotels.reduce((sum, hotel) => sum + (hotel.roomTypes?.length || 0), 0);

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-cyan-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/30 md:p-7">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Building2 className="h-4 w-4" />Property workspace</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Chỗ nghỉ của bạn</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Quản lý hồ sơ chỗ nghỉ, cấu hình loại phòng và theo dõi trạng thái hiển thị trên NestBooking.</p>
          </div>
          <div className="flex flex-wrap gap-2.5"><Button variant="outline" onClick={() => void loadHotels()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới</Button><Button asChild className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700"><Link to="/partner/property-type"><Plus className="mr-1.5 h-4 w-4" />Thêm chỗ nghỉ</Link></Button></div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Tổng chỗ nghỉ" value={hotels.length} hint="Đang được bạn quản lý" tone="blue" />
        <StatCard icon={CheckCircle2} label="Đang hoạt động" value={activeHotels} hint={`${hotels.length ? Math.round(activeHotels / hotels.length * 100) : 0}% tổng chỗ nghỉ`} tone="emerald" />
        <StatCard icon={Clock3} label="Chờ phê duyệt" value={pendingHotels} hint="Đang chờ Admin kiểm duyệt" tone="amber" />
        <StatCard icon={BedDouble} label="Tổng loại phòng" value={totalRoomTypes} hint={`${attentionHotels} chỗ nghỉ cần chú ý`} tone="violet" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full xl:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm tên, thành phố hoặc địa chỉ" /></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Select value={propertyType} onValueChange={setPropertyType}><SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả loại hình</SelectItem>{propertyTypes.map((type) => <SelectItem key={type} value={type}>{propertyLabels[type] || type}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={(value) => setStatus(value as HotelStatus | "ALL")}><SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem><SelectItem value="ACTIVE">Đang hoạt động</SelectItem><SelectItem value="PENDING">Chờ duyệt</SelectItem><SelectItem value="INACTIVE">Tạm ngưng</SelectItem><SelectItem value="REJECTED">Bị từ chối</SelectItem></SelectContent></Select><div className="hidden whitespace-nowrap text-sm text-muted-foreground 2xl:block">{filtered.length} kết quả</div></div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1120px]">
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/70"><TableRow><TableHead className="pl-5">Chỗ nghỉ</TableHead><TableHead>Địa điểm</TableHead><TableHead>Loại phòng</TableHead><TableHead>Hồ sơ</TableHead><TableHead className="w-[155px]">Trạng thái</TableHead><TableHead className="w-[350px] pr-5 text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {!loading && filtered.length ? filtered.map((hotel) => {
                  const completeness = getCompleteness(hotel);
                  return <TableRow key={hotel.id} className={hotel.status === "PENDING" ? "bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-950/10" : "hover:bg-emerald-50/25 dark:hover:bg-zinc-900"}><TableCell className="pl-5"><div className="flex items-center gap-3"><HotelThumbnail hotel={hotel} /><div className="min-w-0"><div className="max-w-64 truncate font-semibold text-slate-900 dark:text-white">{hotel.name}</div><div className="mt-1 flex items-center gap-2 text-xs"><span className="font-medium text-emerald-700 dark:text-emerald-400">{propertyLabels[hotel.propertyType] || hotel.propertyType}</span><span className="text-slate-300">•</span><span className="text-slate-400">ID: {hotel.id.slice(0, 6).toUpperCase()}</span></div></div></div></TableCell><TableCell><div className="flex max-w-56 items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><div className="font-medium text-slate-700 dark:text-zinc-200">{hotel.city}</div><div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{hotel.address}</div></div></div></TableCell><TableCell><div className="inline-flex min-w-[125px] items-center gap-2.5 whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 dark:border-blue-950 dark:bg-blue-950/30"><BedDouble className="h-4 w-4 text-blue-600" /><span className="font-bold">{hotel.roomTypes?.length || 0}</span><span className="text-xs text-muted-foreground">loại phòng</span></div></TableCell><TableCell><ProfileProgress percent={completeness} /></TableCell><TableCell><StatusBadge status={hotel.status as HotelStatus} /></TableCell><TableCell className="pr-5"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" asChild className="h-8 rounded-lg"><Link to={`/partner/hotels/${hotel.id}`}><Pencil className="mr-1.5 h-3.5 w-3.5" />Chỉnh sửa</Link></Button><Button size="sm" variant="outline" asChild className="h-8 rounded-lg"><Link to={`/partner/hotels/${hotel.id}/room-types`}><BedDouble className="mr-1.5 h-3.5 w-3.5" />Loại phòng</Link></Button><Button size="sm" variant="outline" asChild className="h-8 rounded-lg"><Link to={`/partner/hotels/${hotel.id}/rooms`}><DoorOpen className="mr-1.5 h-3.5 w-3.5" />Phòng</Link></Button><Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" disabled={deletingId === hotel.id} aria-label={`Xóa ${hotel.name}`} onClick={() => void removeHotel(hotel)}>{deletingId === hotel.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</Button></div></TableCell></TableRow>;
                }) : <TableRow><TableCell colSpan={6} className="h-52 text-center text-muted-foreground">{loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải danh sách chỗ nghỉ...</span> : hotels.length ? <span><Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />Không có chỗ nghỉ phù hợp với bộ lọc.</span> : <div className="flex flex-col items-center"><Building2 className="mb-3 h-10 w-10 text-slate-300" /><div className="font-semibold text-slate-700 dark:text-zinc-200">Bạn chưa có chỗ nghỉ</div><p className="mt-1 text-sm">Tạo hồ sơ đầu tiên để cấu hình phòng và nhận booking.</p><Button asChild className="mt-4"><Link to="/partner/property-type"><Plus className="mr-1.5 h-4 w-4" />Tạo chỗ nghỉ</Link></Button></div>}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3"><QuickGuide number="01" title="Hoàn thiện hồ sơ" description="Bổ sung ảnh, mô tả, liên hệ và tiện nghi để khách có đủ thông tin." /><QuickGuide number="02" title="Tạo loại phòng" description="Khai báo sức chứa, loại giường và mức giá cho từng hạng phòng." /><QuickGuide number="03" title="Quản lý phòng" description="Tạo phòng vật lý và cập nhật trạng thái sẵn sàng phục vụ." /></div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: LucideIcon; label: string; value: number; hint: string; tone: "blue" | "emerald" | "amber" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300", amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="truncate text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function HotelThumbnail({ hotel }: { hotel: Hotel }) {
  const image = hotel.thumbnail || hotel.images?.[0]?.imageUrl;
  return <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-slate-400" />}</div>;
}

function StatusBadge({ status }: { status: HotelStatus }) {
  const config = statusConfig[status];
  return <Badge variant="outline" className={`whitespace-nowrap ${config.className}`}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dot}`} />{config.label}</Badge>;
}

function ProfileProgress({ percent }: { percent: number }) {
  return <div className="w-32"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Hoàn thiện</span><span className="font-semibold">{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${percent >= 85 ? "bg-emerald-500" : percent >= 60 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${percent}%` }} /></div></div>;
}

function getCompleteness(hotel: Hotel) {
  const fields = [hotel.description, hotel.thumbnail || hotel.images?.[0]?.imageUrl, hotel.phone, hotel.email, hotel.roomTypes?.length, hotel.amenities?.length];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
}

function QuickGuide({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><span className="text-2xl font-black text-emerald-200 dark:text-emerald-900">{number}</span><div><div className="font-semibold text-slate-900 dark:text-white">{title}</div><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p></div></div>;
}
