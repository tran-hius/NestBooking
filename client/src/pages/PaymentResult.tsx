import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"success" | "failed" | "loading">("loading");

  useEffect(() => {
    // Lấy mã phản hồi từ VNPay
    const rspCode = searchParams.get("vnp_ResponseCode");
    
    if (rspCode === "00") {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="w-12 h-12 border-4 border-[#003b95] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Đang xử lý kết quả thanh toán...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Thanh toán thành công!</h1>
            <p className="text-slate-600">
              Đơn đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email thông tin chi tiết đến bạn.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={() => navigate("/my-bookings")}
                className="w-full h-12 bg-[#003b95] hover:bg-[#002a6b] text-white text-base font-bold"
              >
                Xem chuyến đi của tôi
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full h-12 text-base font-bold text-[#003b95]"
              >
                Trở về trang chủ
              </Button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Thanh toán thất bại</h1>
            <p className="text-slate-600">
              Rất tiếc, giao dịch của bạn không thể hoàn tất hoặc đã bị hủy. Vui lòng thử lại.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={() => navigate("/checkout")}
                className="w-full h-12 bg-[#003b95] hover:bg-[#002a6b] text-white text-base font-bold"
              >
                Thử thanh toán lại
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full h-12 text-base font-bold text-slate-600"
              >
                Trở về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
