import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Dumbbell,
  ImageOff,
  ImagePlus,
  Info,
  Mail,
  MapPin,
  ParkingCircle,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Utensils,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { hotelService, type HotelPayload } from "@/api/services/hotelService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HotelImage, PropertyType } from "@/types";
import { toast } from "sonner";

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "HOTEL", label: "Khách sạn" }, { value: "RESORT", label: "Khu nghỉ dưỡng" },
  { value: "VILLA", label: "Biệt thự" }, { value: "APARTMENT", label: "Căn hộ" },
  { value: "HOMESTAY", label: "Homestay" }, { value: "GUESTHOUSE", label: "Nhà khách" },
  { value: "MOTEL", label: "Motel" }, { value: "CAMPING", label: "Khu cắm trại" },
  { value: "GLAMPING", label: "Glamping" }, { value: "CRUISE", label: "Du thuyền" },
  { value: "ENTIRE_HOUSE", label: "Nhà nguyên căn" },
];

const amenityOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "WIFI", label: "Wi-Fi", icon: Wifi }, { value: "BREAKFAST", label: "Bữa sáng", icon: Coffee },
  { value: "POOL", label: "Hồ bơi", icon: Waves }, { value: "PARKING", label: "Bãi đỗ xe", icon: ParkingCircle },
  { value: "RESTAURANT", label: "Nhà hàng", icon: Utensils }, { value: "GYM", label: "Phòng gym", icon: Dumbbell },
  { value: "AIR_CONDITIONING", label: "Điều hòa", icon: Wind }, { value: "SPA", label: "Spa", icon: Sparkles },
];

function createInitialForm(propertyType: PropertyType): HotelPayload {
  return { name: "", description: "", address: "", city: "", country: "Vietnam", phone: "", email: "", thumbnail: "", amenities: [], checkInTime: "14:00", checkOutTime: "12:00", propertyType };
}

export default function AgentHotelForm() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedType = searchParams.get("type") as PropertyType | null;
  const initialType = propertyTypes.some((item) => item.value === requestedType) ? requestedType! : "HOTEL";
  const [form, setForm] = useState<HotelPayload>(() => createInitialForm(initialType));
  const [images, setImages] = useState<HotelImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [loading, setLoading] = useState(Boolean(hotelId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const loadHotel = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const { data } = await hotelService.getManagedHotelById(hotelId);
      setForm({ name: data.name, description: data.description || "", address: data.address, city: data.city, country: data.country, phone: data.phone || "", email: data.email || "", thumbnail: data.thumbnail || "", amenities: data.amenities || [], checkInTime: data.checkInTime || "14:00", checkOutTime: data.checkOutTime || "12:00", propertyType: data.propertyType as PropertyType });
      setImages(data.images || []);
    } catch {
      toast.error("Không thể tải thông tin chỗ nghỉ");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => { void loadHotel(); }, [loadHotel]);

  const previewUrls = useMemo(() => selectedFiles.map((file) => URL.createObjectURL(file)), [selectedFiles]);
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);

  const updateField = <K extends keyof HotelPayload>(field: K, value: HotelPayload[K]) => setForm((current) => ({ ...current, [field]: value }));
  const selectedAmenities = form.amenities || [];
  const selectedPropertyLabel = propertyTypes.find((item) => item.value === form.propertyType)?.label || "Chỗ nghỉ";
  const completion = calculateCompletion(form, images.length + selectedFiles.length);

  const toggleAmenity = (value: string) => {
    updateField("amenities", selectedAmenities.includes(value) ? selectedAmenities.filter((item) => item !== value) : [...selectedAmenities, value]);
  };

  const addCustomAmenity = () => {
    const value = customAmenity.trim().toUpperCase().replace(/\s+/g, "_");
    if (!value || selectedAmenities.includes(value)) return;
    updateField("amenities", [...selectedAmenities, value]);
    setCustomAmenity("");
  };

  const uploadFiles = async (id: string) => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      await hotelService.addHotelImages(id, selectedFiles);
      setSelectedFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error("Vui lòng nhập tên, địa chỉ và thành phố");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Email liên hệ không hợp lệ");
      return;
    }

    const payload: HotelPayload = { ...form, name: form.name.trim(), address: form.address.trim(), city: form.city.trim(), country: form.country?.trim() || "Vietnam", description: form.description?.trim() || undefined, thumbnail: form.thumbnail?.trim() || undefined, email: form.email?.trim() || undefined, phone: form.phone?.trim() || undefined, amenities: selectedAmenities };
    setSaving(true);
    try {
      const response = hotelId ? await hotelService.updateHotel(hotelId, payload) : await hotelService.createHotel(payload);
      await uploadFiles(response.data.id);
      toast.success(hotelId ? "Đã cập nhật chỗ nghỉ" : "Đã tạo chỗ nghỉ và gửi chờ duyệt");
      if (hotelId) await loadHotel();
      else navigate(`/partner/hotels/${response.data.id}`, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể lưu chỗ nghỉ");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (image: HotelImage) => {
    if (!window.confirm("Xóa ảnh này khỏi album chỗ nghỉ?")) return;
    setDeletingImageId(image.id);
    try {
      await hotelService.deleteHotelImage(image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
      toast.success("Đã xóa ảnh");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa ảnh");
    } finally {
      setDeletingImageId(null);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6 pb-28 lg:pb-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" asChild className="-ml-3 self-start rounded-xl text-slate-600 dark:text-zinc-300"><Link to="/partner/hotels"><ArrowLeft className="mr-1.5 h-4 w-4" />Quay lại chỗ nghỉ</Link></Button>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5" /></span><span>Loại hình</span><span className="h-px w-6 bg-slate-200 dark:bg-zinc-700" /><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">2</span><span className="text-emerald-700 dark:text-emerald-400">Thông tin chỗ nghỉ</span></div>
      </div>

      <section className="relative overflow-hidden rounded-[28px] bg-[#063a55] px-6 py-7 text-white shadow-[0_18px_50px_rgba(6,58,85,0.2)] md:px-9 md:py-9">
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100"><Building2 className="h-4 w-4" />{hotelId ? "Property editor" : "Bước 2 trong 2"}</div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">{hotelId ? "Chỉnh sửa chỗ nghỉ" : "Hoàn thiện hồ sơ chỗ nghỉ"}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50/80 md:text-base">Cung cấp thông tin chính xác để khách dễ dàng tìm hiểu và lựa chọn chỗ nghỉ của bạn.</p></div><div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur lg:w-72"><div className="flex items-center justify-between text-xs text-cyan-50/75"><span>Mức độ hoàn thiện</span><span className="font-bold text-white">{completion}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all" style={{ width: `${completion}%` }} /></div><div className="mt-2 text-xs text-cyan-50/70">Bổ sung ảnh, mô tả và liên hệ để hồ sơ rõ ràng hơn.</div></div></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <FormSection number="01" icon={Building2} title="Thông tin cơ bản" description="Tên và loại hình khách sẽ nhìn thấy trên trang tìm kiếm.">
            <div className="space-y-2 md:col-span-2"><Label htmlFor="hotel-name">Tên chỗ nghỉ <Required /></Label><Input id="hotel-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ví dụ: Nest Riverside Hotel" className="h-11 rounded-xl" maxLength={150} required /><FieldHint>Nhập tên thương hiệu đầy đủ, không thêm giá hoặc ưu đãi vào tên.</FieldHint></div>
            <div className="space-y-2"><Label>Loại hình <Required /></Label><Select value={form.propertyType} onValueChange={(value) => updateField("propertyType", value as PropertyType)}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{propertyTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="country">Quốc gia</Label><Input id="country" value={form.country || ""} onChange={(event) => updateField("country", event.target.value)} className="h-11 rounded-xl" /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Giới thiệu chỗ nghỉ</Label><textarea id="description" value={form.description || ""} onChange={(event) => updateField("description", event.target.value)} className="min-h-36 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Mô tả không gian, vị trí, phong cách và trải nghiệm nổi bật..." maxLength={2000} /><div className="flex justify-between text-xs text-muted-foreground"><span>Nội dung rõ ràng giúp khách tự tin hơn khi đặt phòng.</span><span>{form.description?.length || 0}/2000</span></div></div>
          </FormSection>

          <FormSection number="02" icon={MapPin} title="Địa chỉ và liên hệ" description="Thông tin giúp khách tìm đường và liên hệ trực tiếp khi cần.">
            <div className="space-y-2"><Label htmlFor="city">Tỉnh / thành phố <Required /></Label><Input id="city" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Ví dụ: Đà Nẵng" className="h-11 rounded-xl" required /></div>
            <div className="space-y-2 md:col-span-2 md:row-start-2"><Label htmlFor="address">Địa chỉ chi tiết <Required /></Label><div className="relative"><MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input id="address" value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Số nhà, tên đường, phường/xã, quận/huyện" className="h-11 rounded-xl pl-10" required /></div></div>
            <div className="space-y-2"><Label htmlFor="phone">Số điện thoại</Label><div className="relative"><Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input id="phone" type="tel" value={form.phone || ""} onChange={(event) => updateField("phone", event.target.value)} placeholder="0901234567" className="h-11 rounded-xl pl-10" /></div></div>
            <div className="space-y-2"><Label htmlFor="email">Email liên hệ</Label><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input id="email" type="email" value={form.email || ""} onChange={(event) => updateField("email", event.target.value)} placeholder="booking@hotel.com" className="h-11 rounded-xl pl-10" /></div></div>
          </FormSection>

          <FormSection number="03" icon={Clock3} title="Vận hành và tiện nghi" description="Thiết lập thời gian lưu trú và các tiện ích có thật tại chỗ nghỉ.">
            <div className="space-y-2"><Label htmlFor="check-in">Giờ nhận phòng</Label><Input id="check-in" type="time" value={form.checkInTime || ""} onChange={(event) => updateField("checkInTime", event.target.value)} className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label htmlFor="check-out">Giờ trả phòng</Label><Input id="check-out" type="time" value={form.checkOutTime || ""} onChange={(event) => updateField("checkOutTime", event.target.value)} className="h-11 rounded-xl" /></div>
            <div className="space-y-3 md:col-span-2"><Label>Tiện nghi nổi bật</Label><div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{amenityOptions.map((amenity) => { const Icon = amenity.icon; const active = selectedAmenities.includes(amenity.value); return <button key={amenity.value} type="button" onClick={() => toggleAmenity(amenity.value)} className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${active ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-zinc-800"}`}><Icon className="h-4 w-4" /></span>{amenity.label}{active && <Check className="ml-auto h-4 w-4" />}</button>; })}</div></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="custom-amenity">Tiện nghi khác</Label><div className="flex flex-col gap-2 sm:flex-row"><Input id="custom-amenity" value={customAmenity} onChange={(event) => setCustomAmenity(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomAmenity(); } }} placeholder="Ví dụ: Sân thượng" className="h-11 rounded-xl" /><Button type="button" variant="outline" onClick={addCustomAmenity} className="h-11 rounded-xl"><Plus className="mr-1.5 h-4 w-4" />Thêm tiện nghi</Button></div>{selectedAmenities.filter((item) => !amenityOptions.some((option) => option.value === item)).length > 0 && <div className="flex flex-wrap gap-2 pt-1">{selectedAmenities.filter((item) => !amenityOptions.some((option) => option.value === item)).map((item) => <button type="button" key={item} onClick={() => toggleAmenity(item)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-300">{formatAmenity(item)} ×</button>)}</div>}</div>
          </FormSection>

          <FormSection number="04" icon={ImagePlus} title="Hình ảnh chỗ nghỉ" description="Ảnh thật, đủ sáng và rõ không gian sẽ giúp hồ sơ nổi bật hơn.">
            <div className="space-y-2 md:col-span-2"><Label htmlFor="thumbnail">Ảnh đại diện bằng URL</Label><Input id="thumbnail" type="url" value={form.thumbnail || ""} onChange={(event) => updateField("thumbnail", event.target.value)} placeholder="https://..." className="h-11 rounded-xl" /><FieldHint>Có thể bỏ trống nếu bạn tải ảnh trực tiếp ở bên dưới.</FieldHint></div>
            <div className="md:col-span-2"><label htmlFor="hotel-images" className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-emerald-800"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-zinc-900"><ImagePlus className="h-6 w-6" /></span><span className="mt-3 font-semibold text-slate-800 dark:text-white">Chọn ảnh từ thiết bị</span><span className="mt-1 text-sm text-muted-foreground">Tối đa 5 ảnh mỗi lần, định dạng ảnh thông dụng</span><input id="hotel-images" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setSelectedFiles(Array.from(event.target.files || []).slice(0, 5))} /></label></div>
            {(previewUrls.length > 0 || images.length > 0) && <div className="grid grid-cols-2 gap-3 md:col-span-2 sm:grid-cols-3 xl:grid-cols-4">{previewUrls.map((url, index) => <div key={url} className="relative overflow-hidden rounded-xl border border-emerald-200 bg-slate-100"><img src={url} alt={`Ảnh mới ${index + 1}`} className="h-32 w-full object-cover" /><Badge className="absolute left-2 top-2 bg-emerald-600">Ảnh mới</Badge><Button type="button" size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8 rounded-lg" onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}{images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-zinc-700"><img src={image.imageUrl} alt="Ảnh chỗ nghỉ" className="h-32 w-full object-cover" /><Button type="button" size="icon" variant="destructive" disabled={deletingImageId === image.id} className="absolute right-2 top-2 h-8 w-8 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => void deleteImage(image)}><Trash2 className="h-4 w-4" /></Button></div>)}</div>}
          </FormSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-zinc-800 dark:to-zinc-900">{form.thumbnail ? <img src={form.thumbnail} alt="Xem trước chỗ nghỉ" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : previewUrls[0] ? <img src={previewUrls[0]} alt="Xem trước chỗ nghỉ" className="h-full w-full object-cover" /> : images[0] ? <img src={images[0].imageUrl} alt="Xem trước chỗ nghỉ" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageOff className="h-10 w-10 text-slate-300" /></div>}<Badge className="absolute left-3 top-3 bg-[#063a55] text-white">Xem trước</Badge></div><CardContent className="p-5"><div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{selectedPropertyLabel}</div><div className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">{form.name || "Tên chỗ nghỉ"}</div><div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-clamp-2">{form.address || form.city ? [form.address, form.city].filter(Boolean).join(", ") : "Địa chỉ sẽ hiển thị tại đây"}</span></div>{selectedAmenities.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{selectedAmenities.slice(0, 4).map((item) => <span key={item} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{formatAmenity(item)}</span>)}</div>}</CardContent></Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-emerald-600" />Trước khi gửi duyệt</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><ChecklistItem done={Boolean(form.name.trim())} label="Có tên chỗ nghỉ" /><ChecklistItem done={Boolean(form.address.trim() && form.city.trim())} label="Địa chỉ đầy đủ" /><ChecklistItem done={Boolean(form.description?.trim())} label="Có mô tả giới thiệu" /><ChecklistItem done={Boolean(form.phone?.trim() || form.email?.trim())} label="Có thông tin liên hệ" /><ChecklistItem done={Boolean(form.thumbnail || selectedFiles.length || images.length)} label="Có ít nhất một ảnh" /><div className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-muted-foreground dark:border-zinc-800">Sau khi tạo, hồ sơ ở trạng thái chờ duyệt. Bạn vẫn có thể tiếp tục bổ sung loại phòng và phòng vật lý.</div></CardContent></Card>

          {hotelId && <Button type="button" variant="outline" asChild className="h-11 w-full rounded-xl"><Link to={`/partner/hotels/${hotelId}/room-types`}><BedDouble className="mr-2 h-4 w-4" />Quản lý loại phòng<ChevronRight className="ml-auto h-4 w-4" /></Link></Button>}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:static lg:z-auto lg:flex lg:justify-end lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:border-zinc-800 dark:bg-zinc-950/95 lg:dark:bg-transparent"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 lg:mx-0"><div className="hidden text-sm text-muted-foreground sm:block">{hotelId ? "Lưu thay đổi trước khi sang quản lý phòng." : "Thông tin sẽ được gửi Admin kiểm duyệt."}</div><div className="flex w-full gap-2 sm:w-auto"><Button type="button" variant="outline" asChild className="h-11 flex-1 rounded-xl sm:flex-none"><Link to="/partner/hotels">Hủy</Link></Button><Button type="submit" disabled={saving || uploading} className="h-11 flex-1 rounded-xl bg-emerald-600 px-6 font-bold hover:bg-emerald-700 sm:flex-none"><Save className="mr-2 h-4 w-4" />{saving || uploading ? "Đang lưu..." : hotelId ? "Lưu thay đổi" : "Tạo và gửi duyệt"}</Button></div></div></div>
    </form>
  );
}

function FormSection({ number, icon: Icon, title, description, children }: { number: string; icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardHeader className="border-b border-slate-100 pb-4 dark:border-zinc-800"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><Icon className="h-5 w-5" /></span><div><div className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">Mục {number}</div><CardTitle className="mt-0.5 text-lg">{title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div></CardHeader><CardContent className="grid gap-5 p-5 md:grid-cols-2 md:p-6">{children}</CardContent></Card>;
}

function FieldHint({ children }: { children: ReactNode }) { return <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{children}</p>; }
function Required() { return <span className="text-red-500">*</span>; }
function ChecklistItem({ done, label }: { done: boolean; label: string }) { return <div className={`flex items-center gap-2.5 ${done ? "text-slate-700 dark:text-zinc-200" : "text-slate-400"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 dark:bg-zinc-800"}`}>{done && <Check className="h-3.5 w-3.5" />}</span>{label}</div>; }

function calculateCompletion(form: HotelPayload, imageCount: number) {
  const fields = [form.name.trim(), form.address.trim(), form.city.trim(), form.description?.trim(), form.phone?.trim() || form.email?.trim(), imageCount > 0 || form.thumbnail, form.amenities?.length];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
}

function formatAmenity(value: string) {
  return amenityOptions.find((item) => item.value === value)?.label || value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function FormSkeleton() {
  return <div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-56 rounded-[28px] bg-slate-200 dark:bg-zinc-800" /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-6">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 rounded-xl bg-slate-200 dark:bg-zinc-800" />)}</div><div className="h-96 rounded-xl bg-slate-200 dark:bg-zinc-800" /></div></div>;
}
