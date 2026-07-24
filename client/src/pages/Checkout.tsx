import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  MapPin, 
  Info,
  Check,
  Wallet,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppStore } from "@/stores/useAppStore";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);

  // Split fullName into firstName and lastName for the form
  const defaultFullName = user?.profile?.fullName || "";
  const nameParts = defaultFullName.split(" ");
  const defaultLastName = nameParts.length > 1 ? nameParts[0] : "";
  const defaultFirstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : defaultFullName;

  const [formData, setFormData] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    email: user?.email || "",
    phone: user?.profile?.phoneNumber || "",
    country: "VN",
    bookingFor: "main",
    specialRequest: "",
  });

  const handlePayment = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setIsProcessing(true);
    
    // Giả lập xử lý thanh toán
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Đặt phòng thành công!");
      navigate("/my-bookings");
    }, 2000);
  };

  return (
    // Sử dụng màu cố định (light mode) để đảm bảo luôn hiển thị giống hệt giao diện Booking.com
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Stepper */}
        <div className="hidden md:flex items-center justify-center mb-8 text-sm font-medium text-slate-500">
          <div className="flex items-center text-blue-600">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>Lựa chọn của bạn</span>
          </div>
          <div className="w-16 h-px bg-slate-200 mx-4"></div>
          <div className="flex items-center text-blue-600">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">2</div>
            <span>Thông tin của bạn</span>
          </div>
          <div className="w-16 h-px bg-slate-200 mx-4"></div>
          <div className="flex items-center text-slate-400">
            <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs mr-2">3</div>
            <span>Hoàn tất đặt chỗ</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Cột trái: Tóm tắt đơn hàng (Khoảng 1/3) */}
          <div className="w-full lg:w-[350px] space-y-4 shrink-0">
            
            {/* Khách sạn Info */}
            <Card className="overflow-hidden shadow-sm border-slate-200 bg-white">
              <div className="h-40 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 mb-1">
                  ⭐⭐⭐⭐⭐ <span className="bg-yellow-500 text-white px-1 rounded ml-1">Genius</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Khách sạn & Du lịch Hanoi Center Silk Classic</h2>
                <div className="text-sm text-slate-500 mt-2 line-clamp-2">
                  41 Phố Bát Sứ, Hàng Bồ, Hoàn Kiếm, Hà Nội, Việt Nam
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-[#003b95] text-white font-bold text-xs px-1.5 py-1 rounded-sm flex items-center justify-center">8.8</span>
                  <span className="font-semibold text-sm text-slate-900">Xuất sắc</span>
                  <span className="text-xs text-slate-500">· 1,245 đánh giá</span>
                </div>
              </CardContent>
            </Card>

            {/* Thời gian */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Thông tin đặt chỗ của bạn</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 mb-1">Nhận phòng</div>
                    <div className="font-bold text-base text-slate-900">Thứ Sáu, ngày 24<br/>Tháng 7 năm 2026</div>
                    <div className="text-xs text-slate-500 mt-1">14:00 – 00:00</div>
                  </div>
                  <div className="w-px bg-slate-200 mx-2"></div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 mb-1">Trả phòng</div>
                    <div className="font-bold text-base text-slate-900">Thứ Bảy, ngày 25<br/>Tháng 7 năm 2026</div>
                    <div className="text-xs text-slate-500 mt-1">Cho đến 12:00</div>
                  </div>
                </div>
                <div className="text-sm text-slate-900">
                  <div className="font-medium text-slate-600 mb-1">Bạn đã chọn</div>
                  <div className="font-bold text-slate-900">1 đêm, 1 phòng cho 2 người lớn</div>
                  <div className="text-slate-600 mt-1 hover:text-blue-600 cursor-pointer">Thay đổi lựa chọn của bạn</div>
                </div>
              </CardContent>
            </Card>

            {/* Chi tiết giá */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Tóm tắt giá của bạn</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900">Giá gốc</span>
                  <span className="text-slate-900">1,110,000 VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-900">Ưu đãi kỳ nghỉ</span>
                  <span className="text-slate-900">- 131,120 VND</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>Giảm giá Genius</span>
                  <span>- 111,000 VND</span>
                </div>
              </CardContent>
              <div className="bg-[#ebf3ff] p-4 border-t border-slate-200">
                <div className="flex justify-between items-end">
                  <div className="font-bold text-2xl text-slate-900">Tổng cộng</div>
                  <div className="text-right">
                    <div className="text-sm text-red-500 line-through">1,110,000 VND</div>
                    <div className="font-black text-2xl text-slate-900">867,880 VND</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right mt-1">Đã bao gồm thuế và phí</div>
              </div>
            </Card>

          </div>

          {/* Cột phải: Form thông tin & Phương thức thanh toán (Khoảng 2/3) */}
          <div className="flex-1 space-y-6">
            
            {/* Đã đăng nhập */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7b2cbf] flex items-center justify-center text-white font-bold">
                  {user?.profile?.fullName ? user.profile.fullName.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">Bạn đã đăng nhập</div>
                  <div className="text-sm text-slate-500">{user?.email || 'bocbanh@example.com'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Form thông tin cá nhân */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="p-6 pb-2 border-b border-slate-200 mb-4">
                <CardTitle className="text-xl font-bold text-slate-900">Nhập thông tin của bạn</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                  <Info className="w-5 h-5 shrink-0 text-slate-400" />
                  <p>Gần xong rồi! Chỉ cần điền thông tin bắt buộc <span className="text-red-500 font-bold">*</span> vào thôi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-bold text-slate-900">Tên <span className="text-red-500">*</span></Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="h-11 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-bold text-slate-900">Họ <span className="text-red-500">*</span></Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="h-11 border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-slate-900">Địa chỉ email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-11 border-slate-300 bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-500">Email xác nhận sẽ được gửi đến địa chỉ này.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="font-bold text-slate-900">Quốc gia/khu vực <span className="text-red-500">*</span></Label>
                  <Select value={formData.country} onValueChange={(val) => setFormData({...formData, country: val})}>
                    <SelectTrigger className="h-11 border-slate-300 bg-white text-slate-900">
                      <SelectValue placeholder="Chọn quốc gia" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900 border-slate-200">
                      <SelectItem value="VN">Việt Nam</SelectItem>
                      <SelectItem value="US">Hoa Kỳ</SelectItem>
                      <SelectItem value="JP">Nhật Bản</SelectItem>
                      <SelectItem value="KR">Hàn Quốc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-slate-900">Số điện thoại <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select defaultValue="84">
                      <SelectTrigger className="w-[100px] h-11 border-slate-300 bg-white text-slate-900">
                        <SelectValue placeholder="Mã vùng" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900 border-slate-200">
                        <SelectItem value="84">VN +84</SelectItem>
                        <SelectItem value="1">US +1</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phone" 
                      type="tel" 
                      className="flex-1 h-11 border-slate-300 bg-white text-slate-900"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Để chỗ nghỉ liên hệ với bạn.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <Label className="font-bold text-base text-slate-900">Bạn đặt phòng cho ai?</Label>
                    <RadioGroup 
                      value={formData.bookingFor} 
                      onValueChange={(val) => setFormData({...formData, bookingFor: val})}
                      className="gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="main" id="r-main" className="border-slate-400 text-blue-600" />
                        <Label htmlFor="r-main" className="text-slate-900 cursor-pointer">Tôi là khách lưu trú chính</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="r-other" className="border-slate-400 text-blue-600" />
                        <Label htmlFor="r-other" className="text-slate-900 cursor-pointer">Tôi đặt phòng cho người khác</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin hữu ích */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-bold text-slate-900">Thông tin hữu ích</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Không cần thẻ tín dụng.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Hãy linh hoạt: Bạn có thể hủy miễn phí bất cứ lúc nào – hãy nhanh tay đặt mức giá tuyệt vời này ngay hôm nay.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Hiện tại chưa cần thanh toán. Bạn sẽ thanh toán khi đến chỗ nghỉ.</span>
                </div>
              </CardContent>
            </Card>

            {/* Thanh toán */}
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="p-6 pb-2 border-b border-slate-200 mb-4">
                <CardTitle className="text-xl font-bold text-slate-900">Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3 mb-6">
                  <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-[#003b95] bg-[#ebf3ff]' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('vnpay')}>
                    <RadioGroupItem value="vnpay" id="pm-vnpay" className="border-slate-400 text-blue-600" />
                    <Label htmlFor="pm-vnpay" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="h-6 object-contain" />
                        <div className="font-semibold text-slate-900">Thanh toán qua VNPAY</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-[#003b95] bg-[#ebf3ff]' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('credit_card')}>
                    <RadioGroupItem value="credit_card" id="pm-card" className="border-slate-400 text-blue-600" />
                    <Label htmlFor="pm-card" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-slate-500" />
                        <div className="font-semibold text-slate-900">Thẻ thanh toán quốc tế</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${paymentMethod === 'pay_at_hotel' ? 'border-[#003b95] bg-[#ebf3ff]' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('pay_at_hotel')}>
                    <RadioGroupItem value="pay_at_hotel" id="pm-hotel" className="border-slate-400 text-blue-600" />
                    <Label htmlFor="pm-hotel" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-slate-500" />
                        <div className="font-semibold text-slate-900">Thanh toán tại chỗ nghỉ</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex flex-col items-end pt-4">
                  <Button 
                    className="h-12 px-8 text-base font-bold bg-[#003b95] hover:bg-[#002a6b] text-white shadow-sm transition-all rounded-md" 
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      "Hoàn tất đặt phòng"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
