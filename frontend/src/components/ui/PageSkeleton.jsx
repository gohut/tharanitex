import Skeleton, { SkeletonImage, SkeletonText } from "./Skeleton";

const cream = "bg-[#FBF5EA]";

export function ProductGridSkeleton({ count = 8, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="min-w-0">
          <SkeletonImage />
          <div className="mt-3 space-y-2 sm:mt-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16 shrink-0" />
            </div>
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeProductRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-10">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="min-w-0">
          <SkeletonImage />
          <div className="mt-3 space-y-2">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />

      <section>
        <Skeleton className="aspect-[5/2] w-full rounded-none sm:aspect-[16/5]" />
      </section>

      <section className="px-4 py-8 text-center sm:px-8 sm:py-12">
        <Skeleton className="mx-auto h-10 w-64 max-w-full" />
        <Skeleton className="mx-auto mt-4 h-5 w-80 max-w-[90%]" />
        <Skeleton className="mx-auto mt-2 h-5 w-72 max-w-[82%]" />

        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mx-auto mt-3 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 text-center">
          <Skeleton className="mx-auto h-9 w-48" />
          <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-[90%]" />
        </div>
        <HomeProductRowSkeleton />
      </section>

      <section className="px-0 py-4 sm:py-8">
        <Skeleton className="aspect-[5/2] w-full sm:aspect-[16/5]" />
      </section>

      <section className="px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto h-9 w-56" />
          <Skeleton className="mx-auto mt-4 h-5 w-96 max-w-[90%]" />
          <Skeleton className="mx-auto mt-2 h-5 w-80 max-w-[80%]" />
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 text-center">
          <Skeleton className="mx-auto h-9 w-52" />
          <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-[90%]" />
        </div>
        <HomeProductRowSkeleton />
      </section>

      <section className="px-4 py-10 sm:px-8 sm:py-14">
        <Skeleton className="h-8 w-56" />
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function ShopSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
        <Skeleton className="h-9 w-44" />
        <SkeletonText className="mt-3 w-72" />
        <div className="mb-6 mt-7 flex gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  );
}

export function SearchSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-3 h-10 w-56" />
        <Skeleton className="mt-6 h-5 w-44" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="mt-8 border-t border-[#DCCEB9] pt-7">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full" />
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:pt-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-7 w-28" />
            <SkeletonText className="h-5 w-40" />
            <div className="space-y-3 pt-3">
              <SkeletonText className="w-full" />
              <SkeletonText className="w-11/12" />
              <SkeletonText className="w-4/5" />
            </div>
            <Skeleton className="mt-5 h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function CartSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
        <Skeleton className="h-9 w-44" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 border-b border-[#E7DCCB] pb-5">
                <Skeleton className="h-28 w-24 shrink-0 sm:h-36 sm:w-28" />
                <div className="flex-1 space-y-3 pt-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="border border-[#DCCEB9] p-5 sm:p-7">
            <Skeleton className="h-6 w-40" />
            <SkeletonText className="mt-6 w-full" />
            <SkeletonText className="mt-3 w-4/5" />
            <Skeleton className="mt-7 h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function OrdersSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-8 sm:py-12">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border border-[#DCCEB9] p-4 sm:p-6">
              <div className="flex justify-between gap-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="mt-5 flex gap-4">
                <Skeleton className="h-20 w-20 shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <SkeletonText className="w-1/3" />
                  <SkeletonText className="w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function ProfileSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="mt-5 h-7 w-48" />
          <SkeletonText className="mt-2 w-64" />
        </div>
        <div className="mt-10 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}

export function LoginSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <div className="w-full space-y-5">
          <Skeleton className="mx-auto h-10 w-52" />
          <SkeletonText className="mx-auto w-64" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}

export function WishlistSkeleton() {
  return (
    <main className={`min-h-screen ${cream}`}>
      <div className="h-[68px] border-b border-[#E7DCCB] bg-[#FBF5EA] sm:h-[82px]" />
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
        <Skeleton className="h-9 w-48" />
        <SkeletonText className="mt-3 w-72" />
        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B3D2E] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#0D4733] p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[#0D4733] p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function GlobalSkeleton() {
  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <div className="flex h-[68px] items-center justify-center border-b border-[#E7DCCB]">
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-4 h-5 w-80 max-w-full" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
