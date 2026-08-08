import Link from "next/link";

export default function Categories({ categories }) {
  if (!categories) {
    return null;
  }

  const items = categories.items || [];

  if (!items.length) {
    return null;
  }

  return (
    <section className="bg-[#FBF5EA] py-14 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-12">

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[38px] font-light leading-none text-[#D4A437] sm:text-[46px] md:text-[60px] lg:text-[68px]">
            {categories.title}
          </h2>

          {categories.subtitle && (
            <p className="mt-3 text-sm leading-6 text-[#72675A] md:mt-4 md:text-base">
              {categories.subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-5 lg:grid-cols-4 lg:gap-10">

          {items.map((item) => (
            <Link
              key={item.id}
              href={`/search?category=${encodeURIComponent(
                item.slug
              )}`}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-[.76] h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[360px] md:aspect-auto lg:h-[400px]"
                />
              </div>

              <h3 className="mt-3 text-center text-[15px] font-medium tracking-wide text-[#4A433C] transition-colors duration-300 group-hover:text-[#B88718] sm:mt-4 sm:text-[17px] lg:mt-6 lg:text-[19px]">
                {item.name}
              </h3>

              {item.description && (
                <p className="mt-1 text-center text-[10px] tracking-[0.12em] text-[#8A8175] sm:mt-2 sm:text-[13px] sm:tracking-[2px]">
                  {item.description}
                </p>
              )}
            </Link>
          ))}

        </div>

        <div className="mt-12 flex items-center md:mt-20">
          <div className="flex-1 border-t border-[#DCCFB8]" />

          <span className="mx-4 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-[#8A7A65] sm:mx-8 sm:text-sm sm:tracking-[0.25em]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#DCCFB8]" />
        </div>

      </div>
    </section>
  );
}
