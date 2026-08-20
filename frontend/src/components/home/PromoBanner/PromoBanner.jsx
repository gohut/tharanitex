"use client";

import Link from "next/link";

export default function PromoBanner({ banner }) {
  if (!banner?.image) {
    return null;
  }

  const desktopImage = banner.image;
  const mobileImage = banner.mobileImage || banner.image;

  const content = (
    <>
      {/* Desktop banner */}
      <img
        src={desktopImage}
        alt={banner.title || "Promotional Banner"}
        className="block h-auto w-full object-cover promo-banner-desktop"
        draggable={false}
      />

      {/* Mobile banner */}
      <img
        src={mobileImage}
        alt={banner.title || "Promotional Banner"}
        className="hidden h-auto w-full object-cover promo-banner-mobile"
        draggable={false}
      />
    </>
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#FBF5EA]">
      {banner.link ? (
        <Link href={banner.link} className="block w-full">
          {content}
        </Link>
      ) : (
        <div className="block w-full">
          {content}
        </div>
      )}
    </section>
  );
}