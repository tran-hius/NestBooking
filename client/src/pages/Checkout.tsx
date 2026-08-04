import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, CheckCircle2, Info, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAppStore } from "@/stores/useAppStore";
import { bookingService, CreateBookingPayload } from "@/api/services/bookingService";

interface CheckoutData {
  hotelId?: string;
  roomTypeId?: string;
  hotel?: {
    name: string;
    address: string;
    city: string;
    country: string;
    rating?: number;
    images?: { imageUrl: string }[];
  };
  roomType?: { name: string; price: number; maxGuests: number };
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppStore();
  const [checkoutData] = useState<CheckoutData>(() => {
    const state = location.state as CheckoutData | null;
    if (state && state.hotelId && state.roomTypeId && state.hotel && state.roomType) {
      return state;
    }
    sessionStorage.removeItem("checkoutData");
    return {};
  });
  const [paymentMethod, setPaymentMethod] = useState<"pay_at_hotel" | "vnpay">("pay_at_hotel");
  const [isProcessing, setIsProcessing] = useState(false);

  const fullName = user?.profile?.fullName || "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const [formData, setFormData] = useState({
    firstName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : fullName,
    lastName: nameParts.length > 1 ? nameParts[0] : "",
    email: user?.email || "",
    phone: user?.profile?.phoneNumber || "",
    specialRequest: "",
  });

  if (!checkoutData.hotelId || !checkoutData.roomTypeId || !checkoutData.hotel || !checkoutData.roomType) {
    return <Navigate to="/" replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  const fallbackCheckIn = new Date();
  fallbackCheckIn.setDate(fallbackCheckIn.getDate() + 1);
  const parseDate = (val: string) => new Date(val.includes("T") ? val : `${val}T00:00:00`);
  const checkInDate = checkoutData.checkIn ? parseDate(checkoutData.checkIn) : fallbackCheckIn;
  const checkOutDate = checkoutData.checkOut ? parseDate(checkoutData.checkOut) : new Date(checkInDate.getTime() + 86400000);
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));
  const rooms = Number(checkoutData.rooms || 1);
  const adults = Number(checkoutData.adults || 2);
  const children = Number(checkoutData.children || 0);
  const totalAmount = Number(checkoutData.roomType.price) * nights * rooms;
  const dateFormatter = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  const handlePayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error(t("checkout.errRequiredFields"));
      return;
    }

    const payload: CreateBookingPayload = {
      hotelId: checkoutData.hotelId!,
      roomTypeId: checkoutData.roomTypeId!,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      quantity: rooms,
      guestName: `${formData.lastName} ${formData.firstName}`.trim(),
      guestPhone: formData.phone,
      guestEmail: formData.email,
      paymentMethod: paymentMethod === "vnpay" ? "VNPAY" : "PAY_AT_HOTEL",
      specialRequests: formData.specialRequest || undefined,
    };

    setIsProcessing(true);
    try {
      const response = await bookingService.createBooking(payload);
      if (response.data?.paymentUrl) {
        sessionStorage.setItem("pendingVnpayBookingId", response.data.id);
        window.location.assign(response.data.paymentUrl);
        return;
      }
      sessionStorage.removeItem("checkoutData");
      toast.success(t("checkout.successBooking", { code: response.data?.bookingCode || "" }));
      navigate(`/my-bookings?created=${response.data?.id || ""}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("checkout.errCreateBooking"));
    } finally {
      setIsProcessing(false);
    }
  };

  const hotelImage = checkoutData.hotel.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-background pb-12 pt-24 text-foreground">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 hidden items-center justify-center text-sm font-medium text-slate-500 md:flex">
          <div className="flex items-center text-primary"><CheckCircle2 className="mr-2 h-5 w-5" />{t("checkout.stepYourChoice")}</div>
          <div className="mx-4 h-px w-16 bg-border" />
          <div className="flex items-center text-primary"><span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>{t("checkout.stepYourInfo")}</div>
          <div className="mx-4 h-px w-16 bg-border" />
          <div className="flex items-center"><span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border text-xs">3</span>{t("checkout.stepComplete")}</div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 space-y-4 lg:w-[350px]">
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <img src={hotelImage} alt={checkoutData.hotel.name} className="h-44 w-full object-cover" />
              <CardContent className="p-4">
                <div className="mb-2 text-sm font-bold text-yellow-500">★ {checkoutData.hotel.rating || 0}</div>
                <h2 className="text-lg font-bold text-foreground">{checkoutData.hotel.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{checkoutData.hotel.address}, {checkoutData.hotel.city}, {checkoutData.hotel.country}</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-base text-foreground">{t("checkout.bookingInfo")}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="text-sm text-muted-foreground">{t("checkout.checkIn")}</div><div className="mt-1 font-bold text-foreground">{dateFormatter.format(checkInDate)}</div></div>
                  <div><div className="text-sm text-muted-foreground">{t("checkout.checkOut")}</div><div className="mt-1 font-bold text-foreground">{dateFormatter.format(checkOutDate)}</div></div>
                </div>
                <div className="border-t border-border pt-4 text-sm"><div className="font-bold text-foreground">{t("checkout.nightsRoomsGuests", { nights, rooms, guests: adults + children })}</div><div className="mt-1 text-muted-foreground">{checkoutData.roomType.name}</div></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-base text-foreground">{t("checkout.priceSummary")}</CardTitle></CardHeader>
              <CardContent className="p-4 pt-2"><div className="flex justify-between text-sm text-foreground"><span>{t("checkout.nightsRooms", { nights, rooms })}</span><span>{currencyFormatter.format(totalAmount)}</span></div></CardContent>
              <div className="flex items-end justify-between border-t border-border bg-muted/50 p-4 text-foreground"><span className="text-xl font-bold">{t("checkout.totalAmount")}</span><span className="text-2xl font-black">{currencyFormatter.format(totalAmount)}</span></div>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="flex items-center gap-4 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{fullName.charAt(0).toUpperCase() || "U"}</div><div><div className="font-bold text-foreground">{t("checkout.loggedInAs")}</div><div className="text-sm text-muted-foreground">{user?.email}</div></div></CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border p-6"><CardTitle className="text-foreground">{t("checkout.enterYourInfo")}</CardTitle></CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"><Info className="h-5 w-5 shrink-0 text-muted-foreground/70" />{t("checkout.requiredFields")}</div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="lastName">{t("checkout.lastName")}</Label><Input id="lastName" value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="firstName">{t("checkout.firstName")}</Label><Input id="firstName" value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="email">{t("checkout.email")}</Label><Input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="phone">{t("checkout.phone")}</Label><Input id="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="request">{t("checkout.specialRequest")}</Label><Input id="request" value={formData.specialRequest} onChange={(event) => setFormData({ ...formData, specialRequest: event.target.value })} placeholder={t("checkout.specialRequestPlaceholder")} /></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border p-6"><CardTitle className="text-foreground">{t("checkout.paymentMethod")}</CardTitle></CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "pay_at_hotel" | "vnpay")} className="space-y-3">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${paymentMethod === "pay_at_hotel" ? "border-primary bg-primary/5" : "border-border"}`}><RadioGroupItem value="pay_at_hotel" /><Wallet className="h-6 w-6 text-muted-foreground" /><div><div className="font-semibold text-foreground">{t("checkout.payAtHotel")}</div><div className="text-sm text-muted-foreground">{t("checkout.payAtHotelDesc")}</div></div></label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${paymentMethod === "vnpay" ? "border-primary bg-primary/5" : "border-border"}`}><RadioGroupItem value="vnpay" /><img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="h-6" /><div><div className="font-semibold text-foreground">{t("checkout.payViaVnpay")}</div><div className="text-sm text-muted-foreground">{t("checkout.payViaVnpayDesc")}</div></div></label>
                </RadioGroup>
                <div className="mt-5 flex items-start gap-2 text-sm text-muted-foreground"><Check className="h-5 w-5 text-green-600" />{t("checkout.priceVerified")}</div>
                <Button className="mt-6 h-12 w-full text-base font-bold" onClick={() => void handlePayment()} disabled={isProcessing}>{isProcessing ? t("checkout.processing") : t("checkout.confirmBooking")}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
