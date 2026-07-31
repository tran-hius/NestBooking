import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { roomTypeService, RoomTypePayload } from "@/api/services/roomTypeService";
import { BedType, RoomType } from "@/types";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const emptyForm: RoomTypePayload = { name: "", description: "", price: 0, maxGuests: 2, maxAdults: 2, maxChildren: 0, bedType: "DOUBLE", bedCount: 1, area: 25, isActive: true };
const bedTypes: BedType[] = ["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN", "BUNK"];

export default function AgentRoomTypes() {
  const { hotelId = "" } = useParams();
  const [items, setItems] = useState<RoomType[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form, setForm] = useState<RoomTypePayload>(emptyForm);
  const [imageUrl, setImageUrl] = useState("");

  const load = useCallback(async () => { try { const response = await roomTypeService.getByHotel(hotelId); setItems(response.data); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể tải loại phòng"); } }, [hotelId]);
  useEffect(() => { if (hotelId) void load(); }, [hotelId, load]);

  const openForm = (item?: RoomType) => {
    setEditing(item || null);
    setImageUrl("");
    setForm(item ? { name: item.name, description: item.description || "", price: Number(item.price), maxGuests: item.maxGuests, maxAdults: item.maxAdults, maxChildren: item.maxChildren, bedType: item.bedType as BedType, bedCount: item.bedCount, area: item.area || undefined, thumbnail: item.thumbnail || undefined, isActive: item.isActive, amenities: item.amenities || [] } : emptyForm);
    setOpen(true);
  };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!form.name || form.price < 0) return toast.error("Tên và giá phòng không hợp lệ"); try { if (editing) await roomTypeService.update(editing.id, form); else await roomTypeService.create(hotelId, form); toast.success(editing ? "Đã cập nhật loại phòng" : "Đã tạo loại phòng"); setOpen(false); await load(); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể lưu loại phòng"); } };
  const remove = async (item: RoomType) => { if (!window.confirm(`Xóa loại phòng ${item.name}?`)) return; try { await roomTypeService.remove(item.id); toast.success("Đã xóa loại phòng"); await load(); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể xóa loại phòng; hãy tạm ngưng nếu đã có booking"); } };
  const addImage = async () => { if (!editing || !imageUrl.trim()) return; try { await roomTypeService.addImages(editing.id, [imageUrl.trim()]); toast.success("Đã thêm ảnh loại phòng"); setImageUrl(""); await load(); const refreshed = (await roomTypeService.getByHotel(hotelId)).data.find((item) => item.id === editing.id); if (refreshed) setEditing(refreshed); } catch (error: any) { toast.error(error.response?.data?.message || "URL ảnh không hợp lệ"); } };
  const deleteImage = async (imageId: string) => { if (!window.confirm("Xóa ảnh loại phòng này?")) return; try { await roomTypeService.deleteImage(imageId); toast.success("Đã xóa ảnh"); await load(); const refreshed = (await roomTypeService.getByHotel(hotelId)).data.find((item) => item.id === editing?.id); if (refreshed) setEditing(refreshed); } catch (error: any) { toast.error(error.response?.data?.message || "Không thể xóa ảnh"); } };
  const filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<RoomType>[] = [
    { header: "Tên loại phòng", cell: (item) => <div className="flex items-center gap-3"><img src={item.thumbnail || item.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=70"} alt="" className="h-10 w-14 rounded object-cover" /><div><div className="font-semibold">{item.name}</div><div className="text-xs text-muted-foreground">{item.bedCount} {item.bedType}</div></div></div> },
    { header: "Giá/đêm", cell: (item) => <span>{Number(item.price).toLocaleString("vi-VN")} VND</span> },
    { header: "Sức chứa", cell: (item) => <span>{item.maxAdults} người lớn, {item.maxChildren} trẻ em</span> },
    { header: "Số phòng", cell: (item) => <span>{item.totalRooms || 0}</span> },
    { header: "Trạng thái", cell: (item) => <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Đang bán" : "Tạm ngưng"}</Badge> },
    { header: "Thao tác", className: "text-right", cell: (item) => <div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => openForm(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => void remove(item)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return <div><Button variant="ghost" asChild className="mb-3"><Link to="/partner/hotels"><ArrowLeft className="mr-2 h-4 w-4" />Chỗ nghỉ</Link></Button><DataTable title="Loại phòng" subtitle="Thiết lập giá, sức chứa và trạng thái bán" data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} actionButton={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" />Thêm loại phòng</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editing ? "Sửa loại phòng" : "Thêm loại phòng"}</DialogTitle></DialogHeader><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
    <div className="space-y-2 md:col-span-2"><Label>Tên *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
    <div className="space-y-2"><Label>Giá/đêm *</Label><Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div><div className="space-y-2"><Label>Loại giường</Label><Select value={form.bedType} onValueChange={(value) => setForm({ ...form, bedType: value as BedType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{bedTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-2"><Label>Khách tối đa</Label><Input type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} /></div><div className="space-y-2"><Label>Người lớn tối đa</Label><Input type="number" min="1" value={form.maxAdults} onChange={(e) => setForm({ ...form, maxAdults: Number(e.target.value) })} /></div>
    <div className="space-y-2"><Label>Trẻ em tối đa</Label><Input type="number" min="0" value={form.maxChildren} onChange={(e) => setForm({ ...form, maxChildren: Number(e.target.value) })} /></div><div className="space-y-2"><Label>Số giường</Label><Input type="number" min="1" value={form.bedCount} onChange={(e) => setForm({ ...form, bedCount: Number(e.target.value) })} /></div>
    <div className="space-y-2"><Label>Diện tích m²</Label><Input type="number" value={form.area || ""} onChange={(e) => setForm({ ...form, area: Number(e.target.value) || undefined })} /></div><div className="space-y-2"><Label>Trạng thái</Label><Select value={form.isActive ? "true" : "false"} onValueChange={(value) => setForm({ ...form, isActive: value === "true" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Đang bán</SelectItem><SelectItem value="false">Tạm ngưng</SelectItem></SelectContent></Select></div>
    <div className="space-y-2 md:col-span-2"><Label>Thumbnail URL</Label><Input value={form.thumbnail || ""} onChange={(e) => setForm({ ...form, thumbnail: e.target.value || undefined })} placeholder="https://..." /></div>
    <div className="space-y-2 md:col-span-2"><Label>Mô tả</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
    {editing && <div className="space-y-3 border-t pt-4 md:col-span-2"><Label>Album ảnh loại phòng</Label><div className="flex gap-2"><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Dán URL ảnh https://..." /><Button type="button" variant="outline" onClick={() => void addImage()}><ImagePlus className="mr-2 h-4 w-4" />Thêm ảnh</Button></div>{editing.images?.length ? <div className="grid grid-cols-3 gap-2">{editing.images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded border"><img src={image.imageUrl} alt="Room" className="h-24 w-full object-cover" /><Button type="button" size="icon" variant="destructive" className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => void deleteImage(image.id)}><Trash2 className="h-3 w-3" /></Button></div>)}</div> : <p className="text-sm text-muted-foreground">Chưa có ảnh bổ sung.</p>}</div>}
    <Button className="md:col-span-2">Lưu loại phòng</Button>
  </form></DialogContent></Dialog>} /></div>;
}
