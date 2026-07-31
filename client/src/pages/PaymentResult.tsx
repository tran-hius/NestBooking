import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const responseMessages: Record<string, string> = {
  "07": "Giao dịch bị nghi ngờ gian lận.",
  "09": "Thẻ hoặc tài khoản chưa đăng ký Internet Banking.",
  "10": "Thông tin xác thực giao dịch không đúng.",
  "11": "Giao dịch đã hết thời gian chờ thanh toán.",
  "12": "Thẻ hoặc tài khoản đang bị khóa.",
  "13": "Mã OTP không chính xác.",
  "24": "Bạn đã hủy giao dịch.",
  "51": "Tài khoản không đủ số dư.",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Bạn đã nhập sai mật khẩu thanh toán quá số lần quy định.",
  "97": "Chữ ký VNPay không hợp lệ.",
  "99": "Hệ thống chưa thể xác nhận giao dịch.",
};

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status") === "success" ? "success" : "failed";
  const responseCode = searchParams.get("code") || "99";
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (status === "success") {
      sessionStorage.removeItem("checkoutData");
      sessionStorage.removeItem("pendingVnpayBookingId");
    }
  }, [status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        {status === "success" ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle2 className="h-10 w-10" /></div>
            <div><h1 className="text-2xl font-bold text-slate-900">Thanh toán thành công</h1><p className="mt-3 text-slate-600">VNPay đã xác nhận giao dịch và đơn đặt phòng của bạn đã được cập nhật.</p></div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700"><ShieldCheck className="h-5 w-5" />Kết quả đã được xác minh bởi backend</div>
            <div className="flex flex-col gap-3 pt-2"><Button onClick={() => navigate(`/my-bookings${bookingId ? `?created=${bookingId}` : ""}`)} className="h-12 w-full text-base font-bold">Xem đặt phòng của tôi</Button><Button variant="outline" onClick={() => navigate("/")} className="h-12 w-full text-base font-bold">Trở về trang chủ</Button></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600"><XCircle className="h-10 w-10" /></div>
            <div><h1 className="text-2xl font-bold text-slate-900">Thanh toán chưa hoàn tất</h1><p className="mt-3 text-slate-600">{responseMessages[responseCode] || "VNPay không thể hoàn tất giao dịch. Vui lòng kiểm tra lại hoặc chọn phương thức khác."}</p><p className="mt-2 text-xs text-slate-400">Mã phản hồi: {responseCode}</p></div>
            <div className="flex flex-col gap-3 pt-2"><Button onClick={() => navigate("/my-bookings")} className="h-12 w-full text-base font-bold">Xem booking chờ thanh toán</Button><Button variant="outline" onClick={() => navigate("/")} className="h-12 w-full text-base font-bold">Trở về trang chủ</Button></div>
          </div>
        )}
      </div>
    </div>
  );
}
