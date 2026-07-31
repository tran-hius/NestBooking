import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { userService } from "@/api/services/userService";
import SecuritySettings from "@/components/user/SecuritySettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

type ProfileTab = "personal" | "security";

export default function PersonalInfo() {
  const { user, setUser, isAuthenticated } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", address: "" });

  useEffect(() => {
    setForm({
      fullName: user?.profile?.fullName || "",
      phoneNumber: user?.profile?.phoneNumber || "",
      address: user?.profile?.address || "",
    });
  }, [user]);

  if (!isAuthenticated || !user) return <Navigate to="/login?redirect=/settings/personal-details" replace />;

  const completedFields = [user.profile?.fullName, user.profile?.phoneNumber, user.profile?.address, user.profile?.avatarUrl].filter(Boolean).length;
  const profilePercent = Math.round(completedFields / 4 * 100);
  const hasChanges = form.fullName !== (user.profile?.fullName || "")
    || form.phoneNumber !== (user.profile?.phoneNumber || "")
    || form.address !== (user.profile?.address || "");

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim()) return toast.error("Họ tên không được để trống");
    if (form.phoneNumber && !/^[0-9]{9,15}$/.test(form.phoneNumber)) return toast.error("Số điện thoại phải có từ 9 đến 15 chữ số");
    setSaving(true);
    try {
      const response = await userService.updateProfile(user.id, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
      });
      setUser(response.data || response);
      toast.success("Đã cập nhật hồ sơ cá nhân");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Vui lòng chọn một tệp hình ảnh");
    if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh đại diện không được vượt quá 5 MB");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("avatar", file);
      const response = await userService.uploadAvatar(user.id, data);
      setUser(response.data || response);
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải ảnh đại diện");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-20 pt-24">
      <section className="relative overflow-hidden bg-[#05285d] py-12 text-white"><div className="absolute inset-0"><div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" /><div className="absolute right-16 top-5 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" /></div><div className="container relative"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300"><UserRound className="h-4 w-4" />Account settings</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">Hồ sơ cá nhân</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/70">Cập nhật thông tin dùng trong quá trình đặt phòng và quản lý bảo mật tài khoản.</p></div><Button asChild className="w-fit rounded-xl bg-white font-bold text-[#05285d] hover:bg-blue-50"><Link to="/my-bookings">Xem chuyến đi<TicketCheck className="ml-2 h-4 w-4" /></Link></Button></div></div></section>

      <div className="container relative -mt-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200"><CardContent className="p-5"><div className="flex flex-col items-center text-center"><div className="relative"><Avatar className={`h-24 w-24 border-4 border-white shadow-lg ${uploading ? "opacity-50" : ""}`}><AvatarImage src={user.profile?.avatarUrl || ""} /><AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-black text-white">{getInitials(user.profile?.fullName, user.email)}</AvatarFallback></Avatar><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="Thay ảnh đại diện" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-primary text-white shadow-md hover:bg-blue-600">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</button><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadAvatar} /></div><h2 className="mt-4 max-w-full truncate text-lg font-black text-slate-900">{user.profile?.fullName || "Chưa cập nhật tên"}</h2><p className="mt-1 max-w-full truncate text-xs text-slate-500">{user.email}</p><Badge variant="outline" className="mt-3 border-blue-200 bg-blue-50 text-blue-700">{user.role === "AGENT" ? "Đối tác" : "Khách hàng"}</Badge></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-500">Hoàn thiện hồ sơ</span><span className="font-black text-slate-800">{profilePercent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${profilePercent}%` }} /></div><p className="mt-2 text-[11px] leading-relaxed text-slate-400">Tên, điện thoại, địa chỉ và ảnh đại diện giúp checkout thuận tiện hơn.</p></div></CardContent></Card>

            <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><button type="button" onClick={() => setActiveTab("personal")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${activeTab === "personal" ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-50"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${activeTab === "personal" ? "bg-white shadow-sm" : "bg-slate-100"}`}><UserRound className="h-4 w-4" /></span>Thông tin cá nhân</button><button type="button" onClick={() => setActiveTab("security")} className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${activeTab === "security" ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-50"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${activeTab === "security" ? "bg-white shadow-sm" : "bg-slate-100"}`}><ShieldCheck className="h-4 w-4" /></span>Mật khẩu & bảo mật</button></nav>
          </aside>

          <main className="min-w-0">
            {activeTab === "personal" ? <Card className="border-0 shadow-sm ring-1 ring-slate-200"><CardContent className="p-6 md:p-8"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-start"><div><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Thông tin liên hệ</div><h2 className="mt-1 text-2xl font-black text-slate-900">Thông tin cá nhân</h2><p className="mt-2 text-sm text-slate-500">Dữ liệu này được dùng để điền thông tin khách khi bạn đặt phòng.</p></div>{profilePercent === 100 && <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Hồ sơ đầy đủ</span>}</div>

              <form onSubmit={saveProfile} className="mt-7 space-y-6"><div className="grid gap-5 sm:grid-cols-2"><ProfileField label="Họ và tên" icon={UserRound}><Input value={form.fullName} maxLength={100} required className="h-11 rounded-xl pl-10" onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Nhập họ và tên" /></ProfileField><ProfileField label="Số điện thoại" icon={Phone}><Input value={form.phoneNumber} inputMode="numeric" maxLength={15} className="h-11 rounded-xl pl-10" onChange={(event) => setForm({ ...form, phoneNumber: event.target.value.replace(/\D/g, "") })} placeholder="9-15 chữ số" /></ProfileField></div><ProfileField label="Địa chỉ email" icon={Mail}><Input value={user.email} readOnly className="h-11 rounded-xl bg-slate-50 pl-10 text-slate-500" /></ProfileField><div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs leading-relaxed text-blue-700">Email là định danh đăng nhập và hiện không thể thay đổi trong trang hồ sơ.</div><div><Label htmlFor="address" className="text-sm font-bold text-slate-800">Địa chỉ</Label><div className="relative mt-2"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><textarea id="address" value={form.address} maxLength={255} rows={4} className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2" onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Nhập địa chỉ liên hệ" /></div><div className="mt-1 text-right text-[11px] text-slate-400">{form.address.length}/255</div></div><div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="rounded-xl" disabled={!hasChanges || saving} onClick={() => setForm({ fullName: user.profile?.fullName || "", phoneNumber: user.profile?.phoneNumber || "", address: user.profile?.address || "" })}>Hoàn tác</Button><Button type="submit" className="rounded-xl font-bold text-white" disabled={!hasChanges || saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Lưu thay đổi</Button></div></form>
            </CardContent></Card> : <SecuritySettings />}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, icon: Icon, children }: { label: string; icon: typeof UserRound; children: React.ReactNode }) {
  return <div><Label className="text-sm font-bold text-slate-800">{label}</Label><div className="relative mt-2"><Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />{children}</div></div>;
}

function getInitials(name?: string | null, email?: string) {
  if (!name?.trim()) return email?.charAt(0).toUpperCase() || "U";
  return name.trim().split(/\s+/).slice(-2).map((part) => part.charAt(0).toUpperCase()).join("");
}
