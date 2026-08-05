import Link from "next/link";

export default function PromoBanner({ banner }) {
  if (!banner?.image) {
    return null;
  }

  const image = (
    <img
      src={banner.image}
      alt={banner.title || "Promotional Banner"}
      className="block h-auto w-full"
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
          <div className="mx-auto w-full max-w-[1400px] px-8">

            {banner.title && (
              <h2 className="text-3xl font-light text-white md:text-5xl">
                {banner.title}
              </h2>
            )}

            {banner.subtitle && (
              <p className="mt-3 text-base text-white/90 md:text-lg">
                {banner.subtitle}
              </p>
            )}

          </div>
        </div>
      )}

    </section>
  );
}