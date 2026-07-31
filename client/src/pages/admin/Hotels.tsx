import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { Hotel, HotelStatus } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statusConfig: Record<HotelStatus, { label: string; className: string }> = { PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" }, ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" }, INACTIVE: { label: "Đã ẩn", className: "bg-slate-200 text-slate-700" }, REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" } };

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HotelStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const load = async () => { try { setLoading(true); setHotels((await hotelService.getAllHotels(1, 100)).data.data); } catch { toast.error("Không thể tải danh sách chỗ nghỉ"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const updateStatus = async (hotel: Hotel, nextStatus: HotelStatus) => { if (!window.confirm(`Chuyển ${hotel.name} sang trạng thái ${statusConfig[nextStatus].label}?`)) return; try { setUpdating(hotel.id); const response = await hotelService.updateHotelStatus(hotel.id, nextStatus); setHotels((current) => current.map((item) => item.id === hotel.id ? response.data : item)); toast.success("Đã cập nhật trạng thái chỗ nghỉ"); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái"); } finally { setUpdating(null); } };
  const filtered = hotels.filter((hotel) => (status === "ALL" || hotel.status === status) && `${hotel.name} ${hotel.city} ${hotel.address} ${hotel.slug}`.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<Hotel>[] = [
    { header: "Chỗ nghỉ", cell: (hotel) => <div><div className="font-semibold">{hotel.name}</div><div className="text-xs text-muted-foreground">{hotel.propertyType} · {hotel.city}</div></div> },
    { header: "Địa chỉ", cell: (hotel) => <span className="text-sm">{hotel.address}</span> },
    { header: "Loại phòng", cell: (hotel) => hotel.roomTypes?.length || 0 },
    { header: "Đánh giá", cell: (hotel) => hotel.rating ? hotel.rating.toFixed(1) : "Chưa có" },
    { header: "Trạng thái", cell: (hotel) => <Badge className={statusConfig[hotel.status as HotelStatus].className}>{statusConfig[hotel.status as HotelStatus].label}</Badge> },
    { header: "Thao tác", className: "text-right", cell: (hotel) => <div className="flex min-w-[240px] justify-end gap-2"><Button size="sm" variant="outline" asChild><Link to={`/hotel/${hotel.id}`}><Eye className="mr-1 h-4 w-4" />Xem</Link></Button>{hotel.status !== "ACTIVE" && <Button size="sm" disabled={updating === hotel.id} onClick={() => void updateStatus(hotel, "ACTIVE")}><CheckCircle2 className="mr-1 h-4 w-4" />Duyệt</Button>}{hotel.status === "PENDING" && <Button size="sm" variant="destructive" disabled={updating === hotel.id} onClick={() => void updateStatus(hotel, "REJECTED")}><XCircle className="mr-1 h-4 w-4" />Từ chối</Button>}{hotel.status === "ACTIVE" && <Button size="sm" variant="outline" disabled={updating === hotel.id} onClick={() => void updateStatus(hotel, "INACTIVE")}>Ẩn</Button>}</div> },
  ];
  if (loading) return <div className="py-20 text-center text-muted-foreground">Đang tải chỗ nghỉ...</div>;
  return <div className="space-y-4"><div className="max-w-xs"><Select value={status} onValueChange={(value) => setStatus(value as HotelStatus | "ALL")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả trạng thái</SelectItem>{Object.entries(statusConfig).map(([value, config]) => <SelectItem key={value} value={value}>{config.label}</SelectItem>)}</SelectContent></Select></div><DataTable title="Quản lý chỗ nghỉ" subtitle={`${filtered.length} chỗ nghỉ phù hợp`} data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm tên, thành phố hoặc địa chỉ" emptyMessage="Không có chỗ nghỉ phù hợp." /></div>;
}
