import Skeleton, { SkeletonImage, SkeletonText } from "./Skeleton";

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <SkeletonImage className="rounded-2xl" />
          <SkeletonText className="w-3/4" />
          <SkeletonText className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ admin = false }) {
  return (
    <div className={admin ? "min-h-screen bg-green-950 p-6" : "min-h-screen bg-white p-6"}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <SkeletonText className="w-72" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-green-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-green-900 p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-green-900 p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
