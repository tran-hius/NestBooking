import { useRef, useState, useEffect } from "react";
import { ArrowRight, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import HotelCard from "./HotelCard";
import HotelCardSkeleton from "./HotelCardSkeleton";
import { hotelService } from "@/api/services/hotelService";
import { Hotel } from "@/types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PopularHotels() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelService.getAllHotels(1, 10, "ACTIVE");
        if (res?.data?.data) {
          setHotels(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch popular hotels:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320 + 24;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="w-full bg-slate-50 py-20 md:py-24">
      <div className="container relative">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              <Building2 className="h-4 w-4" />
              {t("popularHotels.badge")}
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {t("popularHotels.title")}
            </h2>
            <p className="mt-2 text-slate-500">
              {t("popularHotels.subtitle")}
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label={t("popularHotels.prevAriaLabel")}
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-primary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label={t("popularHotels.nextAriaLabel")}
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-primary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <HotelCardSkeleton key={`skeleton-${idx}`} />
              ))
            : hotels.map((hotel) => {
                const activeRoomTypes = hotel.roomTypes?.filter((roomType) => roomType.isActive) ?? [];
                const lowestPrice = activeRoomTypes.length > 0
                  ? Math.min(...activeRoomTypes.map((roomType) => Number(roomType.price)))
                  : null;
                  
                const mappedHotel = {
                  id: hotel.id,
                  name: hotel.name,
                  location: `${hotel.city}, ${hotel.country}`,
                  rating: hotel.rating ?? 0,
                  price: lowestPrice,
                  imageUrl: hotel.thumbnail || hotel.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  badge: hotel.propertyType,
                };
                
                return <HotelCard key={hotel.id} hotel={mappedHotel} />;
              })}
        </div>

        {!isLoading && hasError && (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
            {t("popularHotels.errorMessage")}
          </div>
        )}

        {!isLoading && !hasError && hotels.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
            {t("popularHotels.emptyMessage")}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => navigate("/search")} className="group inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 font-bold text-primary shadow-sm transition hover:border-primary hover:bg-blue-50">
            {t("popularHotels.viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
