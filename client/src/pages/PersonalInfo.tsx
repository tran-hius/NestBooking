import {
  User,
  Shield,
  Users,
  Sliders,
  CreditCard,
  Bell,
  Camera,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { userService } from "@/api/services/userService";

import { toast } from "sonner";

export default function PersonalInfo() {
  const { user, setUser } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setFormData({
      fullName: user?.profile?.fullName || "",
      phoneNumber: user?.profile?.phoneNumber || "",
      address: (user?.profile as any)?.address || "",
    });
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleSave = async (field: string) => {
    if (!user) return;
    try {
      setIsSaving(true);
      const dataToUpdate = { [field]: formData[field as keyof typeof formData] };
      const result = await userService.updateProfile(user.id, dataToUpdate);
      toast.success("Cập nhật thành công!");
      
      const updatedUser = result.data || result; if (updatedUser) { 
         setUser(updatedUser); 
       }
      setEditingField(null);
    } catch (error) {
      toast.error("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { icon: User, label: "Thông tin cá nhân", active: true },
    { icon: Shield, label: "Cài đặt bảo mật", active: false },
    { icon: Users, label: "Những du khách khác", active: false },
    { icon: Sliders, label: "Tùy chỉnh tùy chọn", active: false },
    { icon: CreditCard, label: "Phương thức thanh toán", active: false },
    { icon: Bell, label: "Bảo mật và quản lý dữ liệu", active: false },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn định dạng ảnh hợp lệ!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      // Gọi API Upload và lấy user mới nhất trả về
      const result = await userService.uploadAvatar(user.id, formData);

      toast.success("Cập nhật ảnh đại diện thành công!");

      // Cập nhật Store luôn mà ko cần gọi lại getMe (tránh cache 304)
      const updatedUser = result.data || result; if (updatedUser) { 
         setUser(updatedUser); 
       }
    } catch (error) {
      toast.error("Tải ảnh thất bại, vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      // Reset input để chọn lại file cũ nếu muốn
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Khoảng trống bù cho Header cố định */}
      <div className="h-20 bg-primary"></div>

      <div className="container mx-auto max-w-6xl px-4 mt-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cột Sidebar Trái */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <nav className="flex flex-col gap-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to="#"
                    className={`flex items-center gap-3 px-5 py-4 transition-colors ${
                      item.active
                        ? "bg-slate-50 border-l-4 border-l-primary text-primary font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-l-transparent font-medium"
                    } ${index !== menuItems.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${item.active ? "text-primary" : "text-slate-400"}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Cột Nội dung Chính */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-10">
            {/* Tiêu đề & Avatar */}
            <div className="flex justify-between items-start mb-10">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {user?.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt="Avatar"
                    className={`w-20 h-20 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0 ${isUploading ? "opacity-50" : ""}`}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 bg-purple-700 text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md flex-shrink-0 ${isUploading ? "opacity-50" : ""}`}
                  >
                    {user?.email?.[0].toUpperCase() || "U"}
                  </div>
                )}

                {/* Overlay hiệu ứng hover / loading */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div className="px-2">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Thông tin cá nhân
                </h2>
                <p className="text-slate-500 text-lg">
                  Hãy cập nhật thông tin của bạn và tìm hiểu xem thông tin đó
                  được sử dụng như thế nào.
                </p>
              </div>

              {/* KHỐI HIỂN THỊ AVATAR CÓ THỂ CLICK */}
            </div>

            {/* Danh sách các trường thông tin */}
            <div className="flex flex-col">
              {/* Tên */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Tên
                </div>
                {editingField === "fullName" ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Nhập tên của bạn"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("fullName")}
                        disabled={isSaving}
                        className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded font-medium hover:bg-slate-200"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 text-slate-700">
                      {user?.profile?.fullName || (
                        <span className="text-slate-400 italic">
                          Chưa cập nhật tên
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEdit("fullName")}
                      className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right"
                    >
                      Biên tập
                    </button>
                  </>
                )}
              </div>

              {/* Địa chỉ email */}
              <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                  Địa chỉ email
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-medium">
                      {user?.email}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      Đã xác minh
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Đây là địa chỉ email bạn dùng để đăng nhập. Đây cũng là địa
                    chỉ chúng tôi gửi xác nhận đặt chỗ cho bạn.
                  </p>

                  {/* Hộp thoại gợi ý đổi số điện thoại */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-2">
                    <p className="text-slate-800 text-sm font-bold mb-2">
                      Không thể truy cập email của bạn?
                    </p>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      Nếu bạn đã thêm số điện thoại di động cho một trong những
                      lần lưu trú trước đây, bạn có thể thay đổi địa chỉ email
                      bằng cách xác minh qua điện thoại di động.
                    </p>
                    <button className="text-primary hover:text-blue-700 text-sm font-bold hover:underline">
                      Thay đổi email bằng xác minh số điện thoại
                    </button>
                  </div>
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1">
                  Biên tập
                </button>
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                  Số điện thoại
                </div>
                {editingField === "phoneNumber" ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Nhập số điện thoại"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("phoneNumber")}
                        disabled={isSaving}
                        className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded font-medium hover:bg-slate-200"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex flex-col gap-2">
                      {user?.profile?.phoneNumber ? (
                        <span className="text-slate-700">
                          {user.profile.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Thêm số điện thoại của bạn
                        </span>
                      )}
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Các cơ sở lưu trú hoặc điểm tham quan mà bạn đặt chỗ sẽ
                        sử dụng số điện thoại này nếu cần liên lạc với bạn.
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit("phoneNumber")}
                      className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1"
                    >
                      Biên tập
                    </button>
                  </>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                  Địa chỉ
                </div>
                {editingField === "address" ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Nhập địa chỉ của bạn"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("address")}
                        disabled={isSaving}
                        className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded font-medium hover:bg-slate-200"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex flex-col gap-2">
                      {(user?.profile as any)?.address ? (
                        <span className="text-slate-700">
                          {(user?.profile as any)?.address}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Thêm địa chỉ của bạn
                        </span>
                      )}
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Chúng tôi sẽ lưu thông tin này để việc đặt chỗ sau này
                        của bạn được thuận tiện hơn.
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit("address")}
                      className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1"
                    >
                      Biên tập
                    </button>
                  </>
                )}
              </div>

              {/* Phần thông tin Agent */}
              {user?.role === "AGENT" && (
                <>
                  <div className="mt-10 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Thông tin Kênh đối tác</h3>
                  </div>

                  {/* Tên doanh nghiệp / Cơ sở */}
                  <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                    <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                      Tên cơ sở kinh doanh
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="text-slate-700">
                        {user?.agentProfile?.businessName || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                      </span>
                    </div>
                    <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1">
                      Biên tập
                    </button>
                  </div>

                  {/* Mã số thuế */}
                  <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                    <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                      Mã số thuế
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="text-slate-700">
                        {user?.agentProfile?.taxCode || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                      </span>
                    </div>
                    <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1">
                      Biên tập
                    </button>
                  </div>

                  {/* Căn cước / Số ĐKKD */}
                  <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                    <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                      Số CMND/CCCD/ĐKKD
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="text-slate-700">
                        {user?.agentProfile?.idNumber || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                      </span>
                    </div>
                    <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1">
                      Biên tập
                    </button>
                  </div>

                  {/* Trạng thái duyệt */}
                  <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                    <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                      Trạng thái xác minh
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="text-slate-700 font-medium">
                        {user?.agentProfile?.approvalStatus === "ACTIVE" ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">Đã xác minh</span>
                        ) : user?.agentProfile?.approvalStatus === "PENDING" ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block">Đang chờ duyệt</span>
                        ) : user?.agentProfile?.approvalStatus === "REJECTED" ? (
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block">Bị từ chối</span>
                        ) : (
                          <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded-md inline-block">{user?.agentProfile?.approvalStatus || "Chưa rõ"}</span>
                        )}
                      </span>
                      <p className="text-slate-500 text-sm leading-relaxed mt-1">
                        Đây là trạng thái xác minh thông tin doanh nghiệp của bạn với hệ thống.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



