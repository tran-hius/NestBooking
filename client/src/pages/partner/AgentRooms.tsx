import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { roomService, RoomPayload } from "@/api/services/roomService";
import { roomTypeService } from "@/api/services/roomTypeService";
import { Room, RoomStatus, RoomType } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statuses: RoomStatus[] = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "BOOKED"];

export default function AgentRooms() {
  const { hotelId = "" } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomPayload>({ roomTypeId: "", roomNumber: "", floor: 1, status: "AVAILABLE", note: "", isActive: true });

  const load = useCallback(async () => { try { const [roomsResponse, typesResponse] = await Promise.all([roomService.getByHotel(hotelId), roomTypeService.getByHotel(hotelId)]); setRooms(roomsResponse.data); setRoomTypes(typesResponse.data); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể tải danh sách phòng"); } }, [hotelId]);
  useEffect(() => { if (hotelId) void load(); }, [hotelId, load]);
  const openForm = (room?: Room) => { setEditing(room || null); setForm(room ? { roomTypeId: room.roomTypeId, roomNumber: room.roomNumber, floor: room.floor || undefined, status: room.status, note: room.note || "", isActive: room.isActive } : { roomTypeId: roomTypes[0]?.id || "", roomNumber: "", floor: 1, status: "AVAILABLE", note: "", isActive: true }); setOpen(true); };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!form.roomTypeId || !form.roomNumber) return toast.error("Vui lòng chọn loại phòng và nhập số phòng"); try { if (editing) await roomService.update(editing.id, { roomNumber: form.roomNumber, floor: form.floor, status: form.status, note: form.note, isActive: form.isActive }); else await roomService.create(hotelId, form); toast.success(editing ? "Đã cập nhật phòng" : "Đã tạo phòng"); setOpen(false); await load(); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể lưu phòng"); } };
  const remove = async (room: Room) => { if (!window.confirm(`Xóa phòng ${room.roomNumber}?`)) return; try { await roomService.remove(room.id); toast.success("Đã xóa phòng"); await load(); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể xóa phòng"); } };
  const typeName = (id: string) => roomTypes.find((type) => type.id === id)?.name || id.slice(0, 8);
  const filtered = rooms.filter((room) => `${room.roomNumber} ${typeName(room.roomTypeId)} ${room.status}`.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<Room>[] = [
    { header: "Số phòng", cell: (room) => <span className="font-semibold">{room.roomNumber}</span> }, { header: "Loại phòng", cell: (room) => typeName(room.roomTypeId) }, { header: "Tầng", cell: (room) => room.floor || "-" },
    { header: "Trạng thái", cell: (room) => <Badge variant={room.status === "AVAILABLE" ? "default" : "secondary"}>{room.status}</Badge> }, { header: "Hoạt động", cell: (room) => room.isActive ? "Có" : "Không" },
    { header: "Thao tác", className: "text-right", cell: (room) => <div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => openForm(room)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => void remove(room)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];
  return <div><Button variant="ghost" asChild className="mb-3"><Link to="/partner/hotels"><ArrowLeft className="mr-2 h-4 w-4" />Chỗ nghỉ</Link></Button><DataTable title="Phòng vật lý" subtitle="Quản lý số phòng và trạng thái vận hành" data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} actionButton={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button disabled={!roomTypes.length} onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" />Thêm phòng</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editing ? "Sửa phòng" : "Thêm phòng"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4">
    <div className="space-y-2"><Label>Loại phòng</Label><Select disabled={!!editing} value={form.roomTypeId} onValueChange={(value) => setForm({ ...form, roomTypeId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roomTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-2"><Label>Số phòng</Label><Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} /></div><div className="space-y-2"><Label>Tầng</Label><Input type="number" value={form.floor || ""} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) || undefined })} /></div>
    <div className="space-y-2"><Label>Trạng thái</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as RoomStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-2"><Label>Ghi chú</Label><Input value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div><Button className="w-full">Lưu phòng</Button>
  </form></DialogContent></Dialog>} /></div>;
}
