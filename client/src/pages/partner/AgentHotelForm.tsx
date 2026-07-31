import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react";
import { hotelService, HotelPayload } from "@/api/services/hotelService";
import { HotelImage, PropertyType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const propertyTypes: PropertyType[] = ["HOTEL", "RESORT", "VILLA", "APARTMENT", "HOMESTAY", "GUESTHOUSE", "MOTEL", "CAMPING", "GLAMPING", "CRUISE", "ENTIRE_HOUSE"];

export default function AgentHotelForm() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState<HotelPayload>({ name: "", description: "", address: "", city: "", country: "Vietnam", phone: "", email: "", thumbnail: "", amenities: [], checkInTime: "14:00", checkOutTime: "12:00", propertyType: (searchParams.get("type") as PropertyType) || "HOTEL" });
  const [amenities, setAmenities] = useState("");

  const loadHotel = useCallback(async () => {
    if (!hotelId) return;
    try {
      const { data } = await hotelService.getHotelById(hotelId);
      setForm({ name: data.name, description: data.description || "", address: data.address, city: data.city, country: data.country, phone: data.phone || "", email: data.email || "", thumbnail: data.thumbnail || "", amenities: data.amenities || [], checkInTime: data.checkInTime || "14:00", checkOutTime: data.checkOutTime || "12:00", propertyType: data.propertyType as PropertyType });
      setAmenities((data.amenities || []).join(", "));
      setImages(data.images || []);
    } catch {
      toast.error("Không thể tải thông tin chỗ nghỉ");
    }
  }, [hotelId]);

  useEffect(() => { void loadHotel(); }, [loadHotel]);

  const uploadFiles = async (id: string) => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      await hotelService.addHotelImages(id, selectedFiles);
      setSelectedFiles([]);
      toast.success("Đã tải ảnh khách sạn");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) return toast.error("Vui lòng nhập tên, địa chỉ và thành phố");
    const payload = { ...form, amenities: amenities.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean), thumbnail: form.thumbnail || undefined, email: form.email || undefined, phone: form.phone || undefined };
    try {
      setSaving(true);
      const response = hotelId ? await hotelService.updateHotel(hotelId, payload) : await hotelService.createHotel(payload);
      await uploadFiles(response.data.id);
      toast.success(hotelId ? "Đã cập nhật chỗ nghỉ" : "Đã tạo chỗ nghỉ, đang chờ duyệt");
      if (hotelId) await loadHotel(); else navigate(`/partner/hotels/${response.data.id}`, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể lưu chỗ nghỉ");
    } finally { setSaving(false); }
  };

  const deleteImage = async (image: HotelImage) => {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      await hotelService.deleteHotelImage(image.id);
      toast.success("Đã xóa ảnh");
      await loadHotel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa ảnh");
    }
  };

  return <div className="mx-auto max-w-4xl space-y-6"><Button variant="ghost" asChild><Link to="/partner/hotels"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Link></Button><Card><CardHeader><CardTitle>{hotelId ? "Chỉnh sửa chỗ nghỉ" : "Tạo chỗ nghỉ mới"}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
    <div className="space-y-2 md:col-span-2"><Label>Tên chỗ nghỉ *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
    <div className="space-y-2"><Label>Loại hình</Label><Select value={form.propertyType} onValueChange={(value) => setForm({ ...form, propertyType: value as PropertyType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-2"><Label>Thành phố *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
    <div className="space-y-2 md:col-span-2"><Label>Địa chỉ *</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
    <div className="space-y-2 md:col-span-2"><Label>Mô tả</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-md border bg-background px-3 py-2" /></div>
    <div className="space-y-2"><Label>Điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div><div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
    <div className="space-y-2 md:col-span-2"><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." /></div>
    <div className="space-y-2 md:col-span-2"><Label>Tiện ích, phân cách bằng dấu phẩy</Label><Input value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="WIFI, BREAKFAST, POOL" /></div>
    <div className="space-y-2"><Label>Giờ nhận phòng</Label><Input type="time" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} /></div><div className="space-y-2"><Label>Giờ trả phòng</Label><Input type="time" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} /></div>
    <div className="space-y-3 md:col-span-2"><Label>Ảnh khách sạn, tối đa 5 ảnh mỗi lần</Label><Input type="file" accept="image/*" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files || []).slice(0, 5))} /><p className="text-xs text-muted-foreground">{selectedFiles.length ? `${selectedFiles.length} ảnh đã chọn` : "Ảnh sẽ được upload sau khi lưu thông tin."}</p></div>
    {images.length > 0 && <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">{images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-lg border"><img src={image.imageUrl} alt="Hotel" className="h-28 w-full object-cover" /><Button type="button" size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => void deleteImage(image)}><Trash2 className="h-4 w-4" /></Button></div>)}</div>}
    <div className="flex justify-end md:col-span-2"><Button disabled={saving || uploading}><Save className="mr-2 h-4 w-4" />{saving || uploading ? "Đang lưu..." : "Lưu chỗ nghỉ"}</Button></div>
  </form></CardContent></Card>{hotelId && <Card><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><ImagePlus className="h-5 w-5 text-primary" />Có thể tiếp tục chọn ảnh mới và bấm Lưu chỗ nghỉ để bổ sung album.</CardContent></Card>}</div>;
}
