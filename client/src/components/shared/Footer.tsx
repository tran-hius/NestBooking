import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 pt-16 pb-8 border-t border-slate-200">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                NestBooking
              </span>
            </div>
            <p className="text-slate-500 mb-6 leading-relaxed max-w-sm">
              Nền tảng đặt phòng trực tuyến hàng đầu, mang đến cho bạn trải nghiệm du lịch tuyệt vời với hàng ngàn lựa chọn lưu trú giá tốt nhất trên toàn cầu.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-sm">Về chúng tôi</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="hover:text-primary transition-colors">Cách đặt chỗ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trợ giúp</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Về NestBooking</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-sm">Chính sách</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Quy chế hoạt động</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách hoàn tiền</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-wider text-sm">Liên hệ</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>support@nestbooking.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} NestBooking. Đồ án lập trình Web.</p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
