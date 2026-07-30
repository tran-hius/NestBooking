import { useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { useSearchHotels } from "@/hooks/useSearchHotels";

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const params = {
    location: searchParams.get("location") || undefined,
    checkInDate: searchParams.get("checkIn") || undefined,
    checkOutDate: searchParams.get("checkOut") || undefined,
    adults: searchParams.get("adults") ? parseInt(searchParams.get("adults")!) : undefined,
    children: searchParams.get("children") ? parseInt(searchParams.get("children")!) : undefined,
    rooms: searchParams.get("rooms") ? parseInt(searchParams.get("rooms")!) : undefined,
  };

  const { hotels, isLoading, error } = useSearchHotels(params);

  const formattedHotels = hotels.map((h: any) => ({
    id: h.id,
    name: h.name,
    image: h.thumbnail || h.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: h.rating || 4.5,
    reviewCount: 100, // Fake data
    reviewText: "Tuyệt vời",
    distance: `${h.city || ''}, ${h.address || ''}`,
    roomType: h.availableRoomTypes?.[0]?.name || "Phòng Tiêu Chuẩn",
    bedType: "1 giường", // Fake data
    hasBreakfast: h.amenities?.includes("BREAKFAST") || false,
    freeCancellation: true,
    noPrepayment: true,
    salePrice: `VND ${(h.availableRoomTypes?.[0]?.price || 1000000).toLocaleString('vi-VN')}`,
  }));

  if (error) {
    console.error("Search failed:", error);
  }

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
          : formattedHotels.length > 0 ? formattedHotels.map((prop) => (
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

