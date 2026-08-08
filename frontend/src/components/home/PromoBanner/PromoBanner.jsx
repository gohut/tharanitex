import Link from "next/link";

export default function PromoBanner({ banner }) {
  if (!banner?.image) {
    return null;
  }

  const image = (
    <img
      src={banner.image}
      alt={banner.title || "Promotional Banner"}
      className="block min-h-[180px] w-full object-cover sm:min-h-0"
    />
  );

  return (
    <section className="relative bg-[#FBF5EA]">

      {banner.link ? (
        <Link href={banner.link}>
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

    </section>
  );
}
