import { useState, useRef } from "react";
import { ArrowRight, Check, Heart, Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import CalendarDropdown from "./CalendarDropdown";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const hasDates = searchParams.has("checkIn") && searchParams.has("checkOut");
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || "1";
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [tempCheckIn, setTempCheckIn] = useState("");
  const [tempCheckOut, setTempCheckOut] = useState("");

  useClickOutside(calendarRef, () => setIsCalendarOpen(false));

  let nights = 1;
  if (urlCheckIn && urlCheckOut) {
    try {
      const start = parseISO(urlCheckIn);
      const end = parseISO(urlCheckOut);
      nights = Math.max(1, differenceInDays(end, start));
    } catch (e) {}
  }
  
  const roomSummary = hasDates
    ? `${nights} ${t("search.propertyCard.nights")}, ${adults} ${t("search.propertyCard.adults")}`
    : t("search.propertyCard.lowestPriceRoom");
    
  const oldPrice = prop.salePrice > 0 ? prop.salePrice * 1.25 : 0; // Fake old price for UI

  const handleDateSelect = (inDate: string, outDate: string) => {
    setTempCheckIn(inDate);
    setTempCheckOut(outDate);
    if (inDate && outDate) {
      setIsCalendarOpen(false);
      const newParams = new URLSearchParams(search);
      newParams.set("checkIn", inDate);
      newParams.set("checkOut", outDate);
      navigate(`/hotel/${prop.id}?${newParams.toString()}`);
    }
  };

  return (
    <article className="group flex flex-col md:flex-row overflow-visible rounded-xl border border-slate-300 bg-white shadow-sm transition hover:shadow-md">
      {/* Left: Image */}
      <div className="relative w-full md:w-60 min-h-52 shrink-0 overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
        <img src={prop.image} alt={prop.name} className="absolute inset-0 h-full w-full object-cover" />
        <button className="absolute right-2 top-2 rounded-full p-1.5 text-white hover:bg-black/20 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Center: Details */}
      <div className="flex flex-1 flex-col p-4 pr-0">
        <div className="flex gap-2 items-center flex-wrap">
          <h3 onClick={() => navigate(`/hotel/${prop.id}${search}`)} className="text-xl font-bold text-blue-700 hover:underline cursor-pointer">{prop.name}</h3>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.round(prop.rating || 5) }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            <ThumbsUp className="h-3 w-3" />
            {t("search.propertyCard.featured")}
          </div>
        </div>
        
        <div className="mt-1 flex items-start gap-1.5 text-sm text-blue-600">
          <a href="#" className="hover:underline font-medium">{prop.distance}</a>
          <span className="text-slate-500 font-normal">·</span>
          <a href="#" className="hover:underline text-blue-600 font-medium">{t("search.propertyCard.viewMap")}</a>
        </div>

        <div className="mt-3 pl-3 border-l-2 border-slate-200">
          <div className="font-bold text-slate-800 text-sm">{prop.roomType}</div>
          {hasDates && (
             <div className="text-xs text-slate-600 mt-0.5">
               {prop.bedCount} {t("search.propertyCard.bed")} {prop.bedType}
             </div>
          )}
          {prop.hasBreakfast && (
            <div className="text-xs font-bold text-green-700 mt-1">
              {t("search.propertyCard.breakfastIncluded")}
            </div>
          )}
          {hasDates && prop.availableRooms > 0 && prop.availableRooms <= 5 && (
            <div className="text-xs font-bold text-red-600 mt-1">
              {t("search.propertyCard.roomsLeft", { count: prop.availableRooms })}
            </div>
          )}
          <div className="text-xs font-bold text-green-700 mt-1 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> {t("search.propertyCard.freeCancellation")}
          </div>
          <div className="text-xs text-green-700">
            {t("search.propertyCard.noPrepayment")}
          </div>
        </div>
      </div>

      {/* Right: Pricing & CTA */}
      <div className="flex flex-col justify-between p-4 w-full md:w-[220px] shrink-0 text-right">
        <div className="flex items-start justify-end gap-2">
          <div>
            <div className="font-bold text-slate-800">{prop.rating >= 9 ? t("search.propertyCard.excellent") : prop.rating >= 8 ? t("search.propertyCard.veryGood") : t("search.propertyCard.good")}</div>
            <div className="text-xs text-slate-500">{(prop.rating * 123).toFixed(0)} {t("search.propertyCard.reviews")}</div>
          </div>
          <div className="bg-blue-800 text-white font-bold rounded-md px-2 py-1.5 flex items-center justify-center min-w-[32px]">
            {prop.rating ? prop.rating.toFixed(1) : "9.5"}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end relative">
          <div className="text-xs text-slate-500 mb-1">{roomSummary}</div>
          
          {hasDates && prop.salePrice > 0 ? (
            <>
              <div className="text-sm text-red-500 line-through decoration-red-500">
                {formatCurrency(oldPrice)}
              </div>
              <div className="text-2xl font-bold text-slate-900 leading-none mb-1">
                {formatCurrency(prop.salePrice)}
              </div>
              <div className="text-xs text-slate-500">{t("search.propertyCard.taxesIncluded")}</div>
            </>
          ) : !hasDates ? (
            <>
              <div className="text-lg font-bold text-slate-700">{t("search.propertyCard.dependsOnRoom")}</div>
              <div className="text-xs text-slate-500">{t("search.propertyCard.selectDateToSeePrice")}</div>
            </>
          ) : (
             <div className="text-lg font-bold text-slate-700">{t("search.propertyCard.contact")}</div>
          )}
          
          <div className="w-full relative" ref={calendarRef}>
            <Button 
              onClick={() => {
                if (!hasDates) {
                  setIsCalendarOpen(!isCalendarOpen);
                } else {
                  navigate(`/hotel/${prop.id}${search}`);
                }
              }} 
              disabled={hasDates && prop.availableRooms === 0} 
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
            >
              {!hasDates ? (
                <>{t("search.propertyCard.selectDateBtn")}<ArrowRight className="ml-1 h-4 w-4" /></>
              ) : prop.availableRooms > 0 ? (
                <>{t("search.propertyCard.checkPriceBtn")}<ArrowRight className="ml-1 h-4 w-4" /></>
              ) : (
                t("search.propertyCard.soldOut")
              )}
            </Button>
            
            {isCalendarOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 z-[100] shadow-2xl rounded-2xl border border-slate-200 bg-white">
                <CalendarDropdown 
                  checkIn={tempCheckIn} 
                  checkOut={tempCheckOut} 
                  onChange={handleDateSelect} 
                  onClose={() => setIsCalendarOpen(false)} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
