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
    <section className="bg-[#FBF5EA] py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-12">

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[42px] font-light leading-tight text-[#D4A437] md:text-[48px] lg:text-[52px]">
            {categories.title}
          </h2>

          {categories.subtitle && (
            <p className="mt-4 text-[15px] leading-7 text-[#72675A] md:text-base">
              {categories.subtitle}
            </p>
          )}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">

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
                  className="h-[300px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[360px] lg:h-[400px]"
                />
              </div>

              <h3 className="mt-6 text-center text-[19px] font-medium tracking-wide text-[#4A433C] transition-colors duration-300 group-hover:text-[#B88718]">
                {item.name}
              </h3>

              {item.description && (
                <p className="mt-2 text-center text-[13px] tracking-[2px] text-[#8A8175]">
                  {item.description}
                </p>
              )}
            </Link>
          ))}

        </div>

        <div className="mt-20 flex items-center">
          <div className="flex-1 border-t border-[#DCCFB8]" />

          <span className="mx-8 text-sm uppercase tracking-[0.25em] text-[#8A7A65]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#DCCFB8]" />
        </div>

      </div>
    </section>
  );
}