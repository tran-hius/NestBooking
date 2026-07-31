import DestinationCard from "./DestinationCard";
import { Compass } from "lucide-react";
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
    <section className="relative overflow-hidden bg-white py-20 md:py-24">
      <div className="container relative z-10">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"><Compass className="h-4 w-4" />Điểm đến từ hệ thống</div><h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Đi đâu trong chuyến tới?</h2><p className="mt-2 text-slate-500">Chọn nhanh một điểm đến đang được mở hiển thị trên NestBooking.</p></div>
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
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-5 md:gap-5">
              {destinations.slice(0, 2).map((item) => (
                <DestinationCard key={item.id} destination={item} />
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
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
