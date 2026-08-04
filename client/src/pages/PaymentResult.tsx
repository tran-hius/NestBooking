import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const { t } = useTranslation();
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

  const errorMessage = t(`paymentResult.errors.${responseCode}`, {
    defaultValue: t("paymentResult.failedDesc"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        {status === "success" ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle2 className="h-10 w-10" /></div>
            <div><h1 className="text-2xl font-bold text-slate-900">{t("paymentResult.successTitle")}</h1><p className="mt-3 text-slate-600">{t("paymentResult.successDesc")}</p></div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700"><ShieldCheck className="h-5 w-5" />{t("paymentResult.backendVerified")}</div>
            <div className="flex flex-col gap-3 pt-2"><Button onClick={() => navigate(`/my-bookings${bookingId ? `?created=${bookingId}` : ""}`)} className="h-12 w-full text-base font-bold">{t("paymentResult.viewMyBookings")}</Button><Button variant="outline" onClick={() => navigate("/")} className="h-12 w-full text-base font-bold">{t("paymentResult.backToHome")}</Button></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600"><XCircle className="h-10 w-10" /></div>
            <div><h1 className="text-2xl font-bold text-slate-900">{t("paymentResult.failedTitle")}</h1><p className="mt-3 text-slate-600">{errorMessage}</p><p className="mt-2 text-xs text-slate-400">{t("paymentResult.responseCode", { code: responseCode })}</p></div>
            <div className="flex flex-col gap-3 pt-2"><Button onClick={() => navigate("/my-bookings")} className="h-12 w-full text-base font-bold">{t("paymentResult.viewPendingBookings")}</Button><Button variant="outline" onClick={() => navigate("/")} className="h-12 w-full text-base font-bold">{t("paymentResult.backToHome")}</Button></div>
          </div>
        )}
      </div>
    </div>
  );
}
