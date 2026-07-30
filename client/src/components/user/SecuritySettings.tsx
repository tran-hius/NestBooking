import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { authService } from "@/api/services/authService";
import { userService } from "@/api/services/userService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SecuritySettings() {
  const { user, clearAuth, setUser } = useAppStore();
  const navigate = useNavigate();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account state
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(user.id);
      toast.success("Đã xóa tài khoản thành công!");
      clearAuth();
      setUser(null);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Xóa tài khoản thất bại!");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Cài đặt bảo mật</h2>
        <p className="text-slate-600">
          Quản lý mật khẩu và bảo mật tài khoản của bạn
        </p>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <Button
            type="submit"
            disabled={isChangingPassword}
            className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Lưu mật khẩu mới
          </Button>
        </form>
      </div>

      {/* DELETE ACCOUNT */}
      <div className="border border-red-200 bg-red-50/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Xóa tài khoản
        </h3>
        <p className="text-sm text-slate-700 mb-4">
          Xóa vĩnh viễn tài khoản của bạn và mọi dữ liệu liên quan. Hành động này không thể hoàn tác.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="font-semibold"
          >
            Yêu cầu xóa tài khoản
          </Button>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-red-200 mt-4">
            <p className="font-semibold text-slate-900 mb-2">Bạn có chắc chắn muốn xóa?</p>
            <p className="text-sm text-slate-600 mb-4">
              Tất cả thông tin cá nhân, lịch sử đặt phòng và đánh giá sẽ bị mất.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Đồng ý xóa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Hủy bỏ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
