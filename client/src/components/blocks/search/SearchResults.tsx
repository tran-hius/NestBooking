import { useState } from "react";
import { Building2, Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { useSearchHotels } from "@/hooks/useSearchHotels";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortOption = "RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [nameFilter, setNameFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("ALL");
  const [breakfastOnly, setBreakfastOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("RECOMMENDED");

  const params = {
    location: searchParams.get("location") || searchParams.get("city") || undefined,
    checkInDate: searchParams.get("checkIn") || undefined,
    checkOutDate: searchParams.get("checkOut") || undefined,
    adults: searchParams.get("adults") ? parseInt(searchParams.get("adults")!) : undefined,
    children: searchParams.get("children") ? parseInt(searchParams.get("children")!) : undefined,
    rooms: searchParams.get("rooms") ? parseInt(searchParams.get("rooms")!) : undefined,
  };

  const { hotels, isLoading, error } = useSearchHotels(params);
  const filteredHotels = hotels
    .filter((hotel) => !nameFilter.trim() || `${hotel.name} ${hotel.city} ${hotel.address}`.toLowerCase().includes(nameFilter.trim().toLowerCase()))
    .filter((hotel) => maxPrice === "ALL" || hotel.startingPrice <= Number(maxPrice))
    .filter((hotel) => !breakfastOnly || hotel.amenities.includes("BREAKFAST"))
    .sort((left, right) => {
      if (sortBy === "PRICE_ASC") return left.startingPrice - right.startingPrice;
      if (sortBy === "PRICE_DESC") return right.startingPrice - left.startingPrice;
      if (sortBy === "RATING_DESC") return right.rating - left.rating;
      return 0;
    });

  const formattedHotels = filteredHotels.map((hotel) => {
    const firstRoom = hotel.availableRoomTypes?.[0];
    return {
      id: hotel.id,
      name: hotel.name,
      image: hotel.thumbnail || hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: hotel.rating,
      distance: `${hotel.city}${hotel.address ? `, ${hotel.address}` : ""}`,
      roomType: firstRoom?.name || "Chưa có loại phòng phù hợp",
      bedCount: firstRoom?.bedCount || 0,
      bedType: firstRoom?.bedType || "",
      availableRooms: firstRoom?.availableRooms || 0,
      hasBreakfast: hotel.amenities.includes("BREAKFAST"),
      salePrice: hotel.startingPrice,
    };
  });

  return (
    <div className="w-full">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-primary"><Building2 className="h-4 w-4" />Kết quả khả dụng</div><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{params.location || "Việt Nam"}: {isLoading ? "Đang tìm..." : `${filteredHotels.length} chỗ nghỉ`}</h2><p className="mt-1 text-sm text-slate-500">Kết quả được lấy từ các chỗ nghỉ đang hoạt động và loại phòng còn khả dụng.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 sm:w-60"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} className="h-10 rounded-xl bg-slate-50 pl-9" placeholder="Tên chỗ nghỉ..." /></div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}><SelectTrigger className="h-10 rounded-xl sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECOMMENDED">Đề xuất</SelectItem><SelectItem value="PRICE_ASC">Giá thấp đến cao</SelectItem><SelectItem value="PRICE_DESC">Giá cao đến thấp</SelectItem><SelectItem value="RATING_DESC">Điểm đánh giá cao</SelectItem></SelectContent></Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><SlidersHorizontal className="h-3.5 w-3.5" />Lọc nhanh</span>{[{ value: "ALL", label: "Mọi mức giá" }, { value: "1000000", label: "Dưới 1 triệu" }, { value: "2000000", label: "Dưới 2 triệu" }, { value: "3000000", label: "Dưới 3 triệu" }].map((option) => <button key={option.value} type="button" onClick={() => setMaxPrice(option.value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${maxPrice === option.value ? "border-primary bg-blue-50 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>{option.label}</button>)}<button type="button" onClick={() => setBreakfastOnly((value) => !value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${breakfastOnly ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}>Có bữa sáng</button></div>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? Array.from({ length: 4 }).map((_, index) => <PropertyCardSkeleton key={index} />) : error ? <EmptyState title="Chưa thể tải kết quả" description={error instanceof Error ? error.message : JSON.stringify(error)} /> : formattedHotels.length ? formattedHotels.map((property) => <PropertyCard key={property.id} prop={property} search={location.search} />) : <EmptyState title="Không tìm thấy chỗ nghỉ phù hợp" description="Hãy thử bỏ bớt bộ lọc, đổi ngày lưu trú hoặc tìm một điểm đến khác." />}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p></div>;
}
