import { useState, useEffect } from "react";
import { searchService } from "@/api/services/searchService";
import { SearchHotel, SearchHotelsParams } from "@/types";

export function useSearchHotels(params: SearchHotelsParams) {
  const [hotels, setHotels] = useState<SearchHotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await searchService.searchHotels(params as any);
        
        if (isMounted) {
          const hotelList = res.data?.data || [];
          
          const formattedHotels: SearchHotel[] = hotelList.map((h: any) => ({
            id: h.id,
            name: h.name,
            thumbnail: h.thumbnail || h.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            rating: h.rating ?? 0,
            address: h.address || '',
            city: h.city || '',
            startingPrice: Number(h.startingPrice || 0),
            availableRoomTypes: (h.availableRoomTypes || []).map((rt: any) => ({
              ...rt,
              bedCount: rt.bedCount || 1,
              bedType: rt.bedType || 'SINGLE'
            })),
            amenities: h.amenities || [],
            images: h.images || [],
          }));
          
          setHotels(formattedHotels);
        }
      } catch (err: any) {
        console.error("SEARCH HOOK ERROR:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHotels();

    return () => {
      isMounted = false;
    };
  }, [
    params.location,
    params.checkInDate,
    params.checkOutDate,
    params.adults,
    params.children,
    params.rooms
  ]);

  return { hotels, isLoading, error };
}
