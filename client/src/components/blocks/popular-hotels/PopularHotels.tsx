import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HotelCard from "./HotelCard";
import HotelCardSkeleton from "./HotelCardSkeleton";
import { hotelService } from "@/api/services/hotelService"; import { Hotel } from "@/types";

export default function PopularHotels() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelService.getAllHotels(1, 10);
        if (res?.data?.data) {
          setHotels(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch popular hotels:", error);
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
            <h2 className="text-3xl font-bold">Khách sạn phổ biến</h2>
            <p className="text-gray-500 mt-2">Được chọn lọc dành riêng cho bạn</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-primary transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
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
            : hotels.map((hotel: any) => {
                const lowestPrice = hotel.roomTypes?.length > 0 
                  ? Math.min(...hotel.roomTypes.map((rt: any) => rt.price))
                  : 1000000;
                  
                const mappedHotel = {
                  id: hotel.id,
                  name: hotel.name,
                  location: `${hotel.city}, ${hotel.country}`,
                  rating: hotel.starRating || 5,
                  reviews: 1245,
                  originalPrice: lowestPrice * 1.2,
                  salePrice: lowestPrice,
                  nights: 1,
                  imageUrl: hotel.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  badge: hotel.propertyType
                };
                
                return <HotelCard key={hotel.id} hotel={mappedHotel} />;
              })}
        </div>

        <div className="mt-10 flex justify-center">
          <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300">
            Khám phá tất cả
          </button>
        </div>
      </div>
    </section>
  );
}
