$ErrorActionPreference = "Stop"

# Run this from:
# D:\Project Files\Tharani Tex\app\tharanitex

$root = (Get-Location).Path
$app = Join-Path $root "frontend\src\app"
$ui = Join-Path $root "frontend\src\components\ui"
$pc = Join-Path $root "frontend\src\components\home\ProductSection"

if (!(Test-Path $app) -or !(Test-Path $ui)) {
    throw "Run this script from the Tharani Tex repository root."
}

$backup = Join-Path $root (".skeleton-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backup -Force | Out-Null

function Backup-And-Write($relative, $content) {
    $target = Join-Path $root $relative
    if (Test-Path $target) {
        $backupTarget = Join-Path $backup $relative
        New-Item -ItemType Directory -Path (Split-Path $backupTarget) -Force | Out-Null
        Copy-Item $target $backupTarget -Force
    }
    New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
    Set-Content -LiteralPath $target -Value $content -Encoding UTF8
}

# Shared skeleton primitive
Backup-And-Write "frontend\src\components\ui\Skeleton.jsx" @'
export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = "", ...props }) {
  return <Skeleton className={`h-4 ${className}`} {...props} />;
}

export function SkeletonImage({ className = "", ...props }) {
  return (
    <Skeleton
      className={`aspect-[3/4] w-full overflow-hidden ${className}`}
      {...props}
    />
  );
}
'@

# Image-level skeleton: remains visible until the real image has loaded.
Backup-And-Write "frontend\src\components\ui\ImageWithSkeleton.jsx" @'
"use client";

import { useState } from "react";

export default function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  wrapperClassName = "",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className={`skeleton-shimmer absolute inset-0 z-0 ${skeletonClassName}`}
        />
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`relative z-10 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
}
'@

# Page-specific skeletons
Backup-And-Write "frontend\src\components\ui\PageSkeleton.jsx" @'
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
'@

# Product-card image-level skeleton.
$productCardPath = "frontend\src\components\home\ProductSection\ProductCard.jsx"
$productCardFull = Join-Path $root $productCardPath
if (Test-Path $productCardFull) {
    $content = Get-Content -LiteralPath $productCardFull -Raw

    if ($content -notmatch 'ImageWithSkeleton') {
        $content = $content.Replace(
            'import Link from "next/link";',
            "import Link from `"next/link`";`r`nimport ImageWithSkeleton from `"@/components/ui/ImageWithSkeleton`";"
        )

        $pattern = '(?s)<img\s+src=\{product\.image\}\s+alt=\{product\.name\}\s+className="[^"]*"\s*/>'
        $replacement = @'
<ImageWithSkeleton
            src={product.image}
            alt={product.name}
            wrapperClassName="aspect-[3/4] w-full"
            skeletonClassName="bg-[#F0E6D5]"
            className="h-full w-full object-contain bg-[#F8F3EA] transition-transform duration-700 group-hover:scale-105"
/>
'@

        $updated = [regex]::Replace($content, $pattern, $replacement, 1)

        if ($updated -eq $content) {
            Write-Warning "ProductCard image block did not match. ProductCard was not modified."
        } else {
            Backup-And-Write $productCardPath $updated
        }
    }
}

# Footer is withheld during the browser's initial resource load.
# On client-side navigation, it is immediately available.
Backup-And-Write "frontend\src\components\Footer\ConditionalFooter.jsx" @'
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
      return;
    }

    const handleLoad = () => setReady(true);
    window.addEventListener("load", handleLoad, { once: true });

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (!ready) return null;

  return <Footer />;
}
'@

# Route-specific loading boundaries.
Backup-And-Write "frontend\src\app\loading.jsx" @'
import { GlobalSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <GlobalSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\home\loading.js" @'
import { HomeSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <HomeSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\products\loading.js" @'
import { ShopSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <ShopSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\collections\loading.js" @'
import { ShopSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <ShopSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\search\loading.js" @'
import { SearchSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <SearchSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\product\loading.js" @'
import { ProductDetailSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <ProductDetailSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\cart\loading.js" @'
import { CartSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <CartSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\orders\loading.js" @'
import { OrdersSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <OrdersSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\wishlist\loading.js" @'
import { WishlistSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <WishlistSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\profile\loading.js" @'
import { ProfileSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <ProfileSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\login\loading.js" @'
import { LoginSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <LoginSkeleton />;
}
'@

Backup-And-Write "frontend\src\app\admin\loading.js" @'
import { AdminSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <AdminSkeleton />;
}
'@

# Add the cream/gold shimmer once.
$globalsPath = Join-Path $root "frontend\src\app\globals.css"
$globals = Get-Content -LiteralPath $globalsPath -Raw

if ($globals -notmatch '\.skeleton-shimmer') {
    Add-Content -LiteralPath $globalsPath -Encoding UTF8 -Value @'

/* =========================================================
   THARANI PAGE SKELETONS
   ========================================================= */

@keyframes tharaniSkeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    100deg,
    #eee3d1 20%,
    #f8f1e5 38%,
    #eee3d1 56%
  );
  background-size: 220% 100%;
  animation: tharaniSkeletonShimmer 1.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: none;
    background: #eee3d1;
  }
}
'@
}

Write-Host ""
Write-Host "Skeleton system applied successfully." -ForegroundColor Green
Write-Host "Backup created at:" -ForegroundColor Cyan
Write-Host "  $backup"
Write-Host ""
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "  cd frontend"
Write-Host "  npm run build"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Inspect git diff before committing." -ForegroundColor Yellow
