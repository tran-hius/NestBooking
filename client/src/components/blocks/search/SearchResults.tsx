import { useState } from "react";
import { Building2, Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { useSearchHotels } from "@/hooks/useSearchHotels";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

type SortOption = "RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

import SidebarFilters from "./SidebarFilters";

export default function SearchResults() {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [nameFilter, setNameFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("ALL");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
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
    .filter((hotel) => propertyTypes.length === 0 || propertyTypes.includes(hotel.propertyType))
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
      roomType: firstRoom?.name || t("search.noRoomType"),
      bedCount: firstRoom?.bedCount || 0,
      bedType: firstRoom?.bedType || "",
      availableRooms: firstRoom?.availableRooms || 0,
      hasBreakfast: hotel.amenities.includes("BREAKFAST"),
      salePrice: hotel.startingPrice,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <aside className="hidden lg:block sticky top-24">
        <SidebarFilters 
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          propertyTypes={propertyTypes}
          setPropertyTypes={setPropertyTypes}
        />
      </aside>
      
      <main className="w-full min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {params.location || "Việt Nam"}: {isLoading ? t("search.finding") : t("search.found", { count: filteredHotels.length })}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-medium text-slate-600">{t("search.sortBy")}</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-10 w-[200px] rounded-full bg-white font-medium shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECOMMENDED">{t("search.sortRecommended")}</SelectItem>
                <SelectItem value="PRICE_ASC">{t("search.sortPriceAsc")}</SelectItem>
                <SelectItem value="PRICE_DESC">{t("search.sortPriceDesc")}</SelectItem>
                <SelectItem value="RATING_DESC">{t("search.sortRatingDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <PropertyCardSkeleton key={index} />)
          ) : error ? (
            <EmptyState title={t("search.errorTitle")} description={error instanceof Error ? error.message : JSON.stringify(error)} />
          ) : formattedHotels.length ? (
            formattedHotels.map((property) => <PropertyCard key={property.id} prop={property} search={location.search} />)
          ) : (
            <EmptyState title={t("search.noResultTitle")} description={t("search.noResultDesc")} />
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p></div>;
}
