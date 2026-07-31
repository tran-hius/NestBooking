import DestinationCard from "./DestinationCard";
import { Plane, Globe2, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { destinationService, Destination } from "@/api/services/destinationService";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await destinationService.getAllDestinations();
        setDestinations(res.data.filter((destination) => destination.isActive).slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Decorative Icons */}
      <div className="absolute top-20 -left-12 text-slate-200 -z-10 rotate-12 opacity-80">
        <Plane size={300} />
      </div>
      <div className="absolute top-60 -right-20 text-slate-200 -z-10 -rotate-12 opacity-80">
        <Globe2 size={400} />
      </div>
      <div className="absolute bottom-10 left-1/4 text-slate-200 -z-10 rotate-45 opacity-60">
        <Compass size={150} />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Điểm đến thịnh hành</h2>
          <p className="text-gray-500 mt-2">
            Du khách tìm kiếm Việt Nam cũng đã đặt những nơi này
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
            </div>
          </div>
        ) : hasError ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-gray-500">
            Chưa thể tải điểm đến. Vui lòng thử lại sau.
          </div>
        ) : destinations.length > 0 ? (
          <>
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 md:gap-6 md:mb-6">
              {destinations.slice(0, 2).map((item) => (
                <DestinationCard key={item.id} destination={item} />
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              {destinations.slice(2, 5).map((item) => (
                <DestinationCard key={item.id} destination={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Không có dữ liệu điểm đến.
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingDestinations;
