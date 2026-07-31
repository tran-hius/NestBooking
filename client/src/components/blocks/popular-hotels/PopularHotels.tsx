import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HotelCard from "./HotelCard";
import HotelCardSkeleton from "./HotelCardSkeleton";
import { hotelService } from "@/api/services/hotelService";
import { Hotel } from "@/types";
import { useNavigate } from "react-router-dom";

export default function PopularHotels() {
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
    <section className="w-full py-12">
      <div className="container mx-auto relative">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Chỗ nghỉ nổi bật</h2>
            <p className="text-gray-500 mt-2">Những chỗ nghỉ đang mở đặt phòng trên NestBooking</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Xem khách sạn trước"
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-primary transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Xem khách sạn tiếp theo"
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-primary transition shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0"
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
            Chưa thể tải danh sách khách sạn. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !hasError && hotels.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
            Hiện chưa có khách sạn đang hoạt động.
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => navigate("/search")} className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300">
            Xem tất cả chỗ nghỉ
          </button>
        </div>
      </div>
    </section>
  );
}
