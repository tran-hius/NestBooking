import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, DoorOpen, HotelIcon, Plus, Trash2 } from "lucide-react";
import { hotelService } from "@/api/services/hotelService";
import { Hotel } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusLabels: Record<string, string> = { ACTIVE: "Đang hoạt động", PENDING: "Chờ duyệt", INACTIVE: "Tạm ngưng", REJECTED: "Bị từ chối" };

export default function AgentHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHotels = async () => {
    try {
      setLoading(true);
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
    if (!window.confirm(`Xóa chỗ nghỉ ${hotel.name}?`)) return;
    try {
      await hotelService.deleteHotel(hotel.id);
      toast.success("Đã xóa chỗ nghỉ");
      await loadHotels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa chỗ nghỉ");
    }
  };

  const filtered = hotels.filter((hotel) => `${hotel.name} ${hotel.city} ${hotel.address}`.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<Hotel>[] = [
    { header: "Chỗ nghỉ", cell: (hotel) => <div className="flex items-center gap-3"><img src={hotel.thumbnail || hotel.images?.[0]?.imageUrl} alt="" className="h-12 w-16 rounded-md bg-slate-100 object-cover" /><div><div className="font-semibold">{hotel.name}</div><div className="text-xs text-muted-foreground">{hotel.city}</div></div></div> },
    { header: "Loại hình", cell: (hotel) => <span>{hotel.propertyType}</span> },
    { header: "Trạng thái", cell: (hotel) => <Badge variant={hotel.status === "ACTIVE" ? "default" : "secondary"}>{statusLabels[hotel.status] || hotel.status}</Badge> },
    { header: "Loại phòng", cell: (hotel) => <span>{hotel.roomTypes?.length || 0}</span> },
    { header: "Thao tác", className: "text-right", cell: (hotel) => <div className="flex justify-end gap-2"><Button size="sm" variant="outline" asChild><Link to={`/partner/hotels/${hotel.id}`}><HotelIcon className="mr-1 h-4 w-4" />Sửa</Link></Button><Button size="sm" variant="outline" asChild><Link to={`/partner/hotels/${hotel.id}/room-types`}><Building2 className="mr-1 h-4 w-4" />Loại phòng</Link></Button><Button size="sm" variant="outline" asChild><Link to={`/partner/hotels/${hotel.id}/rooms`}><DoorOpen className="mr-1 h-4 w-4" />Phòng</Link></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => void removeHotel(hotel)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  if (loading) return <div className="py-20 text-center text-muted-foreground">Đang tải chỗ nghỉ...</div>;
  return <DataTable title="Chỗ nghỉ của tôi" subtitle="Quản lý khách sạn, loại phòng và phòng vật lý" data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm theo tên hoặc thành phố" emptyMessage="Bạn chưa có chỗ nghỉ nào." actionButton={<Button asChild><Link to="/partner/property-type"><Plus className="mr-2 h-4 w-4" />Thêm chỗ nghỉ</Link></Button>} />;
}
