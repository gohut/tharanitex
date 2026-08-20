import Link from "next/link";

export default function PromoBanner({ banner }) {
  if (!banner?.image) {
    return null;
  }

  const image = (
    <picture>
      <source
        media="(max-width: 767px)"
        srcSet={banner.mobileImage || banner.image}
      />

      <img
        src={banner.image}
        alt={banner.title || "Promotional Banner"}
        className="..."
      />
    </picture>
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#FBF5EA]">
      <div className="relative aspect-[16/7] w-full sm:aspect-auto">
        {banner.link ? (
          <Link href={banner.link} className="block h-full w-full">
            {image}
          </Link>
        ) : (
          image
        )}

        {(banner.title || banner.subtitle) && (
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
              {banner.title && (
                <h2 className="text-2xl font-light leading-tight text-white sm:text-3xl md:text-5xl">
                  {banner.title}
                </h2>
              )}

              {banner.subtitle && (
                <p className="mt-2 text-sm leading-6 text-white/90 sm:mt-3 sm:text-base md:text-lg">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}