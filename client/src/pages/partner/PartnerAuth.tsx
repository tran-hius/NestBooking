import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/api/services/authService";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";

export default function PartnerAuth() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { user, setToken, setUser } = useAppStore();
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập trước khi đăng ký làm đối tác.");
      navigate("/auth");
    } else {
      setFullName(user.profile?.fullName || "");
      setPhoneNumber(user.profile?.phoneNumber || "");
      setAddress(user.profile?.address || "");
    }
  }, [user, navigate]);

  const handleNextStep = () => {
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName || !phoneNumber || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerPartner({
        fullName,
        phoneNumber,
        address,
      });
      
      const accessToken = response.data?.tokens?.accessToken;
      const updatedUser = response.data?.user;

      if (!accessToken || updatedUser?.role !== "AGENT") {
        toast.error("Có lỗi xảy ra khi tạo tài khoản đối tác");
        return;
      }

      setToken(accessToken);
      setUser(updatedUser);

      toast.success("Tạo tài khoản đối tác thành công!");
      setStep(3);
    } catch (error: any) {
      console.error("Partner Register Error", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full bg-primary h-16 flex items-center px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            NestBooking
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center text-sm font-medium text-slate-600 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </button>
          )}
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Trở thành đối tác của NestBooking" : step === 2 ? "Hoàn thiện thông tin đối tác" : "Đăng ký thành công!"}
          </h1>
          <p className="text-slate-600 mb-8">
            {step === 1 ? "Tiếp cận hàng triệu khách hàng và tăng doanh thu của bạn." : step === 2 ? "Vui lòng cung cấp các thông tin liên lạc để hoàn tất hồ sơ." : "Hồ sơ đối tác của bạn đã được thiết lập thành công."}
          </p>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Đăng chỗ nghỉ miễn phí</h3>
                    <p className="text-sm text-slate-600">Không có phí ẩn, chỉ tính hoa hồng khi có khách đặt.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Kiểm soát toàn diện</h3>
                    <p className="text-sm text-slate-600">Bạn quyết định giá cả, tình trạng phòng trống và quy định.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Hỗ trợ 24/7</h3>
                    <p className="text-sm text-slate-600">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleNextStep} className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-md">
                Tiếp tục đăng ký
              </Button>
            </div>
          ) : step === 2 ? (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 mb-2">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Nhập họ và tên đầy đủ"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-bold text-slate-900 mb-2">
                  Số điện thoại
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Ví dụ: 0987654321"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-bold text-slate-900 mb-2">
                  Địa chỉ
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full h-12 rounded-md border border-slate-300 py-1.5 px-4 text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <Button disabled={loading} type="submit" className="w-full h-12 mt-2 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-md">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận đăng ký đối tác"}
              </Button>
            </form>
          ) : step === 3 ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-slate-600 mb-6">
                Bây giờ bạn có thể truy cập vào trang quản lý Dashboard để xem thống kê, theo dõi doanh thu và tạo cơ sở lưu trú của mình.
              </p>
              <Link to="/partner/dashboard" className="block w-full">
                <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-md">
                  Đi đến Dashboard
                </Button>
              </Link>
            </div>
          ) : null}

          <div className="mt-12 text-center text-xs text-slate-500">
            <p className="mb-2">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <a href="#" className="text-primary hover:underline">Điều khoản và Điều kiện</a>{" "}
              cũng như{" "}
              <a href="#" className="text-primary hover:underline">Tuyên bố về Quyền riêng tư</a> của chúng tôi.
            </p>
            <p>Bản quyền (2006-2026) © NestBooking.com™</p>
          </div>
        </div>
      </main>
    </div>
  );
}