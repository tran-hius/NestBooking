import { Skeleton } from "@/components/ui/skeleton";

export default function HotelCardSkeleton() {
  return (
    <div className="min-w-[320px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm snap-start">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-48" />
      
      {/* Content Skeleton */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
