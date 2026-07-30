import { useState, useEffect } from "react";
import { searchService } from "@/api/services/searchService";
import { Hotel, SearchHotelsParams } from "@/types";

export function useSearchHotels(params: SearchHotelsParams) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
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
          
          const formattedHotels: Hotel[] = hotelList.map((h: any) => ({
            id: h.id,
            name: h.name,
            thumbnail: h.thumbnail || h.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            rating: h.rating || 4.5,
            reviewCount: 100, // Fake data
            address: h.address || '',
            city: h.city || '',
            availableRoomTypes: h.availableRoomTypes || [{ name: "Phòng Tiêu Chuẩn", price: 1000000 }],
            amenities: h.amenities || [],
            images: h.images || [],
            roomTypes: h.roomTypes || []
          }));
          
          setHotels(formattedHotels);
        }
      } catch (err: any) {
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
