import { ArrowRight, BedDouble, Check, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import { differenceInDays, parseISO } from "date-fns";

export interface PropertyProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
  roomType: string;
  bedCount: number;
  bedType: string;
  availableRooms: number;
  hasBreakfast: boolean;
  salePrice: number;
}

export default function PropertyCard({ prop, search }: { prop: PropertyProps; search: string }) {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const hasDates = searchParams.has("checkIn") && searchParams.has("checkOut");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || "1";
  
  let nights = 1;
  if (checkIn && checkOut) {
    try {
      const start = parseISO(checkIn);
      const end = parseISO(checkOut);
      nights = Math.max(1, differenceInDays(end, start));
    } catch (e) {}
  }
  
  const roomSummary = hasDates
    ? `${nights} đêm, phòng ${adults} người lớn, ${prop.bedCount} giường`
    : "Loại phòng có mức giá khởi điểm thấp nhất trong kết quả.";

  return (
    <article className="group grid overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg md:grid-cols-[260px_1fr_210px]">
      <div className="relative min-h-56 overflow-hidden bg-slate-100 md:min-h-[250px]"><img src={prop.image} alt={prop.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" /><div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 backdrop-blur"><BedDouble className="mr-1 inline h-3.5 w-3.5 text-primary" />{hasDates ? `${prop.availableRooms} phòng trống` : "Đa dạng phòng"}</div></div>

      <div className="flex min-w-0 flex-col p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-xl font-black text-slate-900 transition group-hover:text-primary">{prop.name}</h3><div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="line-clamp-2">{prop.distance}</span></div></div>{prop.rating > 0 && <div className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-sm font-bold text-blue-700"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{prop.rating.toFixed(1)}</div>}</div><div className="mt-5 rounded-xl border-l-4 border-blue-400 bg-blue-50/60 p-3"><div className="font-bold text-slate-800">{prop.roomType}</div><div className="mt-1 text-xs text-slate-500">{roomSummary}</div></div><div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-5 text-xs font-semibold text-emerald-700">{prop.hasBreakfast && <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" />Có bữa sáng</span>}<span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" />Xem điều kiện khi chọn phòng</span></div></div>

      <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/60 p-5 md:border-l md:border-t-0">
        <div className="text-right">
          {hasDates ? (
            <>
              <div className="text-xs font-medium text-slate-500">Giá từ mỗi đêm</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">{prop.salePrice > 0 ? formatCurrency(prop.salePrice) : "Liên hệ"}</div>
              <div className="mt-1 text-xs text-slate-400">Giá có thể thay đổi theo ngày</div>
            </>
          ) : (
            <>
              <div className="text-xs font-medium text-slate-500">Giá phòng</div>
              <div className="mt-1 text-lg font-bold text-slate-700">Tùy loại phòng</div>
              <div className="mt-1 text-xs text-slate-400">Vui lòng chọn ngày để xem</div>
            </>
          )}
        </div>
        <Button 
          onClick={() => {
            if (!hasDates) {
              window.dispatchEvent(new Event("open-calendar"));
            } else {
              navigate(`/hotel/${prop.id}${search}`);
            }
          }} 
          disabled={hasDates && prop.availableRooms === 0} 
          className="mt-6 h-11 w-full rounded-xl font-bold text-white"
        >
          {!hasDates ? (
            <>Chọn ngày<ArrowRight className="ml-1 h-4 w-4" /></>
          ) : prop.availableRooms > 0 ? (
            <>Xem phòng<ArrowRight className="ml-1 h-4 w-4" /></>
          ) : (
            "Hết phòng"
          )}
        </Button>
      </div>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
