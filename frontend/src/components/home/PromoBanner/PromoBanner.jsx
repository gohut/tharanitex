import Link from "next/link";

export default function PromoBanner({ banner }) {
  if (!banner?.image) {
    return null;
  }

  const image = (
    <picture>
      {/* Mobile-specific banner */}
      <source
        media="(max-width: 767px)"
        srcSet={banner.mobileImage || banner.image}
      />

      <img
        src={banner.image}
        alt={banner.title || "Promotional Banner"}
        className="
          block
          h-auto
          w-full
          object-contain
        "
      />
    </picture>
  );

  return (
    <section className="w-full bg-[#FBF5EA] py-6 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1600px] px-0 sm:px-5 md:px-8">
        <div className="relative w-full overflow-hidden rounded-none sm:rounded-md">

          {banner.link ? (
            <Link
              href={banner.link}
              className="block w-full"
            >
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
      </div>
    </section>
  );
}