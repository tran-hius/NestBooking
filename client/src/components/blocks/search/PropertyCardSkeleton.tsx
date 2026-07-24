import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Image Skeleton */}
      <Skeleton className="relative w-full md:w-64 h-48 md:h-56 shrink-0 rounded-xl" />

      {/* Content Skeleton */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>

        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-10 w-24 rounded-lg mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
