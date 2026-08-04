import { useEffect, useState } from "react";
import {
  Eye,
  Globe2,
  ImagePlus,
  Map,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Destination, destinationService } from "@/api/services/destinationService";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface DestinationForm {
  name: string;
  slug: string;
  country: string;
  countryFlag: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
}

const emptyForm: DestinationForm = {
  name: "",
  slug: "",
  country: "Vietnam",
  countryFlag: "VN",
  description: "",
  imageUrl: "",
  isActive: true,
  isFeatured: false,
};

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const response = await destinationService.getAdminDestinations();
      setDestinations(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách điểm đến");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDestinations(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setPreviewUrl("");
    setFormOpen(true);
  };

  const openEdit = (destination: Destination) => {
    setEditing(destination);
    setForm({
      name: destination.name,
      slug: destination.slug,
      country: destination.country,
      countryFlag: destination.countryFlag,
      description: destination.description || "",
      imageUrl: destination.imageUrl,
      isActive: destination.isActive,
      isFeatured: destination.isFeatured,
    });
    setSelectedFile(null);
    setPreviewUrl(destination.imageUrl);
    setFormOpen(true);
  };

  const updateDestination = async (destination: Destination, data: Partial<Destination>, success: string) => {
    setUpdatingId(destination.id);
    try {
      const response = await destinationService.updateDestination(destination.id, data);
      setDestinations((current) => current.map((item) => item.id === destination.id ? response.data : item));
      toast.success(success);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật điểm đến");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleFeatured = async (destination: Destination) => {
    setUpdatingId(destination.id);
    try {
      const response = await destinationService.toggleFeatured(destination.id);
      setDestinations((current) => current.map((item) => item.id === destination.id ? response.data : item));
      toast.success(response.data.isFeatured ? "Đã đưa điểm đến lên trang chủ" : "Đã gỡ điểm đến khỏi mục nổi bật");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái nổi bật");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing && !selectedFile) return toast.error("Vui lòng chọn ảnh điểm đến");
    setSubmitting(true);
    try {
      if (editing) {
        const response = await destinationService.updateDestination(editing.id, form);
        setDestinations((current) => current.map((item) => item.id === editing.id ? response.data : item));
        toast.success("Đã cập nhật điểm đến");
      } else {
        const data = new FormData();
        data.append("name", form.name.trim());
        data.append("slug", form.slug.trim());
        data.append("country", form.country.trim());
        data.append("countryFlag", form.countryFlag.trim());
        data.append("description", form.description.trim());
        data.append("image", selectedFile as File);
        await destinationService.createDestination(data);
        toast.success("Đã tạo điểm đến mới");
        await loadDestinations();
      }
      setFormOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể lưu điểm đến");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDestination = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await destinationService.deleteDestination(deleting.id);
      setDestinations((current) => current.filter((item) => item.id !== deleting.id));
      toast.success("Đã xóa điểm đến");
      setDeleting(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa điểm đến");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = destinations.filter((destination) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || `${destination.name} ${destination.slug} ${destination.country} ${destination.description || ""}`.toLowerCase().includes(keyword);
    const matchesVisibility = visibility === "ALL"
      || (visibility === "FEATURED" && destination.isFeatured)
      || (visibility === "ACTIVE" && destination.isActive)
      || (visibility === "HIDDEN" && !destination.isActive);
    return matchesSearch && matchesVisibility;
  });

  const activeCount = destinations.filter((destination) => destination.isActive).length;
  const featuredCount = destinations.filter((destination) => destination.isFeatured).length;
  const countries = new Set(destinations.map((destination) => destination.country)).size;

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[26px] border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-cyan-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-sky-950/30 md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-950 dark:text-cyan-300"><Map className="h-4 w-4" />Destination content</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý điểm đến</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">Xây dựng danh mục khám phá, kiểm soát nội dung hiển thị và lựa chọn các điểm đến nổi bật trên trang chủ.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => void loadDestinations()} disabled={loading} className="h-10 gap-2 rounded-xl bg-white dark:bg-zinc-900"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới</Button>
            <Button onClick={openCreate} className="h-10 gap-2 rounded-xl bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4" />Thêm điểm đến</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={MapPin} label="Tổng điểm đến" value={destinations.length} hint="Danh mục toàn hệ thống" tone="sky" />
        <StatCard icon={Eye} label="Đang hiển thị" value={activeCount} hint={`${destinations.length ? Math.round(activeCount / destinations.length * 100) : 0}% tổng danh mục`} tone="blue" />
        <StatCard icon={Sparkles} label="Nổi bật" value={featuredCount} hint="Xuất hiện trên trang chủ" tone="amber" />
        <StatCard icon={Globe2} label="Quốc gia" value={countries} hint="Phạm vi điểm đến" tone="violet" />
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5 dark:border-zinc-800">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-10 dark:bg-zinc-900" placeholder="Tìm tên, slug, quốc gia hoặc mô tả" />
            </div>
            <div className="flex items-center gap-3">
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả điểm đến</SelectItem><SelectItem value="FEATURED">Đang nổi bật</SelectItem><SelectItem value="ACTIVE">Đang hiển thị</SelectItem><SelectItem value="HIDDEN">Đang ẩn</SelectItem></SelectContent>
              </Select>
              <div className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">{filtered.length} kết quả</div>
            </div>
          </div>

          {loading ? <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải điểm đến...</div> : filtered.length ? <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((destination) => <DestinationCard key={destination.id} destination={destination} updating={updatingId === destination.id} onEdit={openEdit} onDelete={setDeleting} onToggleFeatured={toggleFeatured} onToggleActive={(item) => void updateDestination(item, { isActive: !item.isActive }, item.isActive ? "Đã ẩn điểm đến" : "Đã hiển thị điểm đến")} />)}</div> : <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground"><MapPin className="mb-3 h-10 w-10 text-slate-300" /><div className="font-medium">Không có điểm đến phù hợp</div><div className="mt-1 text-sm">Thử thay đổi từ khóa hoặc bộ lọc.</div></div>}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!submitting) setFormOpen(open); }}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? "Chỉnh sửa điểm đến" : "Thêm điểm đến mới"}</DialogTitle><DialogDescription>{editing ? "Cập nhật nội dung và trạng thái hiển thị của điểm đến." : "Tạo nội dung khám phá mới cho khách hàng trên NestBooking."}</DialogDescription></DialogHeader>
          <form onSubmit={submitForm} className="space-y-5">
            <div className="relative h-44 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900">{previewUrl ? <img src={previewUrl} alt="Xem trước điểm đến" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center text-slate-400"><ImagePlus className="mb-2 h-9 w-9" /><span className="text-sm">Chưa có ảnh xem trước</span></div>} {!editing && <label htmlFor="destination-image" className="absolute inset-x-3 bottom-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950/75 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-slate-950/90"><Upload className="h-4 w-4" />{selectedFile ? selectedFile.name : "Chọn ảnh điểm đến"}<input id="destination-image" type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }} /></label>}</div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Tên điểm đến"><Input value={form.name} required maxLength={100} placeholder="Ví dụ: Đà Lạt" onChange={(event) => { const name = event.target.value; setForm((current) => ({ ...current, name, slug: editing || current.slug ? current.slug : slugify(name) })); }} /></Field><Field label="Slug"><Input value={form.slug} required maxLength={100} placeholder="da-lat" onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></Field><Field label="Quốc gia"><Input value={form.country} required maxLength={100} onChange={(event) => setForm({ ...form, country: event.target.value })} /></Field><Field label="Mã/cờ quốc gia"><Input value={form.countryFlag} required maxLength={10} placeholder="VN hoặc emoji cờ" onChange={(event) => setForm({ ...form, countryFlag: event.target.value })} /></Field></div>
            {editing && <Field label="URL ảnh"><Input type="url" value={form.imageUrl} required onChange={(event) => { setForm({ ...form, imageUrl: event.target.value }); setPreviewUrl(event.target.value); }} /></Field>}
            <Field label="Mô tả ngắn"><textarea value={form.description} rows={4} className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Điểm nổi bật và trải nghiệm đặc trưng..." onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
            {editing && <div className="grid gap-3 sm:grid-cols-2"><ToggleField label="Hiển thị công khai" description="Cho phép điểm đến xuất hiện với khách hàng" checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} /><ToggleField label="Điểm đến nổi bật" description="Ưu tiên hiển thị trên trang chủ" checked={form.isFeatured} onChange={(checked) => setForm({ ...form, isFeatured: checked })} /></div>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Hủy</Button><Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo điểm đến"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !submitting) setDeleting(null); }}>
        <DialogContent className="max-w-md rounded-2xl"><DialogHeader><div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><Trash2 className="h-6 w-6" /></div><DialogTitle>Xóa điểm đến?</DialogTitle><DialogDescription>Điểm đến <strong>{deleting?.name}</strong> sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.</DialogDescription></DialogHeader><DialogFooter className="mt-3"><Button variant="outline" onClick={() => setDeleting(null)} disabled={submitting}>Quay lại</Button><Button variant="destructive" onClick={() => void deleteDestination()} disabled={submitting}>{submitting ? "Đang xóa..." : "Xác nhận xóa"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

function DestinationCard({ destination, updating, onEdit, onDelete, onToggleFeatured, onToggleActive }: { destination: Destination; updating: boolean; onEdit: (item: Destination) => void; onDelete: (item: Destination) => void; onToggleFeatured: (item: Destination) => void; onToggleActive: (item: Destination) => void }) {
  return <article className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-950 ${destination.isFeatured ? "border-amber-200 dark:border-amber-900" : "border-slate-200 dark:border-zinc-800"}`}><div className="relative h-44 overflow-hidden bg-slate-100"><img src={destination.imageUrl} alt={destination.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" /><div className="absolute left-3 top-3 flex gap-2">{destination.isFeatured && <Badge className="border-0 bg-amber-400 text-amber-950 hover:bg-amber-400"><Sparkles className="mr-1 h-3 w-3" />Nổi bật</Badge>}<Badge className={destination.isActive ? "border-0 bg-sky-500 text-white hover:bg-sky-500" : "border-0 bg-slate-700 text-white hover:bg-slate-700"}>{destination.isActive ? "Đang hiển thị" : "Đang ẩn"}</Badge></div><div className="absolute inset-x-0 bottom-0 p-4 text-white"><h2 className="text-xl font-bold">{destination.name}</h2><div className="mt-1 flex items-center gap-1.5 text-sm text-slate-200"><span>{destination.countryFlag}</span><span>{destination.country}</span><span>•</span><span>/{destination.slug}</span></div></div></div><div className="p-4"><p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{destination.description || "Chưa có mô tả cho điểm đến này."}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800"><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-xs font-medium text-slate-500"><Switch checked={destination.isFeatured} disabled={updating} onCheckedChange={() => onToggleFeatured(destination)} />Nổi bật</label><label className="flex items-center gap-2 text-xs font-medium text-slate-500"><Switch checked={destination.isActive} disabled={updating} onCheckedChange={() => onToggleActive(destination)} />Hiển thị</label></div><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Sửa ${destination.name}`} onClick={() => onEdit(destination)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" aria-label={`Xóa ${destination.name}`} onClick={() => onDelete(destination)}><Trash2 className="h-4 w-4" /></Button></div></div></div></article>;
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof MapPin; label: string; value: number; hint: string; tone: "sky" | "blue" | "amber" | "violet" }) {
  const tones = { sky: "bg-sky-50 text-sky-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" };
  return <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-zinc-800"><CardContent className="flex items-center gap-4 p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div><div className="text-sm text-muted-foreground">{label}</div><div className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</div><div className="text-xs text-slate-400">{hint}</div></div></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function ToggleField({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-zinc-800"><div><div className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{label}</div><div className="mt-1 text-xs text-muted-foreground">{description}</div></div><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
