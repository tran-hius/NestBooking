import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { authService } from "@/api/services/authService";
import { userService } from "@/api/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

export default function SecuritySettings() {
  const { user, clearAuth, setUser } = useAppStore();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changing, setChanging] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    if (newPassword !== confirmPassword) return toast.error("Mật khẩu mới không khớp");
    setChanging(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Đã đổi mật khẩu");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setChanging(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await userService.deleteUser(user.id);
      clearAuth();
      setUser(null);
      toast.success("Tài khoản đã được vô hiệu hóa");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setDeleting(false);
    }
  };

  return <div className="space-y-6"><Card className="border-0 shadow-sm ring-1 ring-slate-200"><CardContent className="p-6 md:p-8"><div className="border-b border-slate-100 pb-6"><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Account security</div><h2 className="mt-1 text-2xl font-black text-slate-900">Mật khẩu & bảo mật</h2><p className="mt-2 text-sm text-slate-500">Thay đổi mật khẩu dùng để đăng nhập vào NestBooking.</p></div><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]"><form onSubmit={changePassword} className="space-y-4"><PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} visible={showPasswords} autoComplete="current-password" /><PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} visible={showPasswords} autoComplete="new-password" /><PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} visible={showPasswords} autoComplete="new-password" /><button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary">{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</button><div><Button type="submit" disabled={changing} className="rounded-xl font-bold text-white">{changing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}Cập nhật mật khẩu</Button></div></form><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><ShieldCheck className="h-5 w-5" /></div><h3 className="mt-4 font-black text-slate-900">Bảo vệ tài khoản</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600"><li>Không chia sẻ mật khẩu hoặc mã OTP.</li><li>Dùng mật khẩu khác với các dịch vụ khác.</li><li>Liên hệ hỗ trợ nếu phát hiện truy cập bất thường.</li></ul></div></div></CardContent></Card>

    <Card className="border-0 bg-red-50/60 shadow-sm ring-1 ring-red-200"><CardContent className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm"><AlertTriangle className="h-5 w-5" /></div><div><h3 className="font-black text-red-900">Vô hiệu hóa tài khoản</h3><p className="mt-1 max-w-xl text-sm leading-relaxed text-red-800/70">Thao tác này xóa mềm tài khoản và đăng xuất bạn khỏi NestBooking. Việc khôi phục cần được xử lý bởi quản trị viên.</p></div></div><Button variant="destructive" className="shrink-0 rounded-xl" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Xóa tài khoản</Button></CardContent></Card>

    <Dialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}><DialogContent className="max-w-md rounded-2xl"><DialogHeader><div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><Trash2 className="h-6 w-6" /></div><DialogTitle>Xóa tài khoản NestBooking?</DialogTitle><DialogDescription>Tài khoản sẽ bị vô hiệu hóa và bạn sẽ được đăng xuất. Bạn không thể tự khôi phục tài khoản từ giao diện hiện tại.</DialogDescription></DialogHeader><DialogFooter className="mt-3"><Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Quay lại</Button><Button variant="destructive" onClick={() => void deleteAccount()} disabled={deleting}>{deleting ? "Đang xử lý..." : "Xác nhận xóa"}</Button></DialogFooter></DialogContent></Dialog></div>;
}

function PasswordField({ label, value, onChange, visible, autoComplete }: { label: string; value: string; onChange: (value: string) => void; visible: boolean; autoComplete: string }) {
  return <div><Label className="text-sm font-bold text-slate-800">{label}</Label><div className="relative mt-2"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} required autoComplete={autoComplete} className="h-11 rounded-xl pl-10" /></div></div>;
}
