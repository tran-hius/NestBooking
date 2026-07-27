import { useState, useEffect } from "react";
import { searchService } from "@/api/services/searchService";
import { useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

export default function SearchResults() {
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const searchParams = new URLSearchParams(location.search);
        
        const params = {
          location: searchParams.get("location") || undefined,
          // Extract other params if needed
        };

        const res = await searchService.searchHotels(params);
        
        // Ensure the API matches PropertyProps format, or map it:
        const formattedHotels = (res.data || []).map((h: any) => ({
          id: h.id,
          name: h.name,
          image: h.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          rating: 4.5, // Giả lập nếu chưa có
          reviewCount: 100,
          distance: `${h.city}, ${h.country}`,
          roomType: h.roomTypes?.[0]?.name || "Phòng Tiêu Chuẩn",
          bedType: "1 giường",
          hasBreakfast: true,
          freeCancellation: true,
          noPrepayment: true,
          salePrice: `VND ${(h.roomTypes?.[0]?.price || 1000000).toLocaleString('vi-VN')}`,
        }));

        setProperties(formattedHotels);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [location.search]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tất cả chỗ nghỉ</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sắp xếp theo:</span>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-primary">
            <option>Đề xuất của chúng tôi</option>
            <option>Giá (Thấp đến cao)</option>
            <option>Giá (Cao xuống thấp)</option>
            <option>Đánh giá sao (Cao nhất)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <PropertyCardSkeleton key={idx} />
            ))
          : properties.length > 0 ? properties.map((prop) => (
              <PropertyCard key={prop.id} prop={prop} />
            )) : (
              <div className="text-center py-10 text-slate-500">
                Không tìm thấy chỗ nghỉ nào phù hợp.
              </div>
            )}
      </div>
    </div>
  );
}

