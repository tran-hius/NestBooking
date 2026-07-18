import {
  User,
  Shield,
  Users,
  Sliders,
  CreditCard,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PersonalInfo() {
  const menuItems = [
    { icon: User, label: "Thông tin cá nhân", active: true },
    { icon: Shield, label: "Cài đặt bảo mật", active: false },
    { icon: Users, label: "Những du khách khác", active: false },
    { icon: Sliders, label: "Tùy chỉnh tùy chọn", active: false },
    { icon: CreditCard, label: "Phương thức thanh toán", active: false },
    { icon: Bell, label: "Bảo mật và quản lý dữ liệu", active: false },
  ];

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
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Thông tin cá nhân
                </h2>
                <p className="text-slate-500 text-lg">
                  Hãy cập nhật thông tin của bạn và tìm hiểu xem thông tin đó
                  được sử dụng như thế nào.
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-700 text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md flex-shrink-0">
                B
              </div>
            </div>

            {/* Danh sách các trường thông tin */}
            <div className="flex flex-col">
              {/* Tên */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Tên
                </div>
                <div className="flex-1 text-slate-700">bánh lọc bánh</div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right">
                  Biên tập
                </button>
              </div>

              {/* Tên hiển thị */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Tên hiển thị
                </div>
                <div className="flex-1 text-slate-400 italic">
                  Chọn tên hiển thị
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right">
                  Biên tập
                </button>
              </div>

              {/* Địa chỉ email */}
              <div className="flex flex-col sm:flex-row items-start justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium mt-1">
                  Địa chỉ email
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700">le***8c@gmail.com</span>
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
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-slate-400 italic">
                    Thêm số điện thoại của bạn
                  </span>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Các cơ sở lưu trú hoặc điểm tham quan mà bạn đặt chỗ sẽ sử
                    dụng số điện thoại này nếu cần liên lạc với bạn.
                  </p>
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right mt-1">
                  Biên tập
                </button>
              </div>

              {/* Ngày sinh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Ngày sinh
                </div>
                <div className="flex-1 text-slate-400 italic">
                  Nhập ngày sinh của bạn
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right">
                  Biên tập
                </button>
              </div>

              {/* Quốc tịch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-200 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Quốc tịch
                </div>
                <div className="flex-1 text-slate-400 italic">
                  Chọn quốc gia/vùng lãnh thổ bạn đến từ
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right">
                  Biên tập
                </button>
              </div>

              {/* Giới tính */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4">
                <div className="w-full sm:w-1/4 text-slate-900 font-medium">
                  Giới tính
                </div>
                <div className="flex-1 text-slate-400 italic">
                  Chọn giới tính của bạn
                </div>
                <button className="text-primary hover:text-blue-700 font-bold hover:underline text-left sm:text-right">
                  Biên tập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
