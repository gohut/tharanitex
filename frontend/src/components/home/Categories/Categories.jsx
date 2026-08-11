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
    <section className="bg-[#FBF5EA] py-5 md:py-8 lg:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-12">

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-center text-[34px] font-light leading-none text-[#D4A437] sm:text-[46px] md:text-[60px] lg:text-[68px]">
            {categories.title}
          </h2>

          {categories.subtitle && (
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-[#72675A] md:mt-3 md:text-base">
              {categories.subtitle}
            </p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-5 lg:mt-6 lg:grid-cols-4 lg:gap-8">

          {items.map((item) => (
            <Link
              key={item.id}
              href={`/collections/${item.slug}`}
              className="group flex h-full flex-col cursor-pointer"
            >
              <div className="overflow-hidden bg-white transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[360px] md:aspect-auto lg:h-[400px]"
                />
              </div>

              <div className="flex flex-1 flex-col items-center justify-start px-2 pb-1 pt-3 sm:pt-4 lg:pt-5">
                <h3 className="font-cormorant-garamond text-center text-[22px] font-medium uppercase leading-tight tracking-[0.04em] text-[#4A433C] sm:text-[24px] lg:text-[27px]">
                  {item.name}
                </h3>

                {item.subtitle && (
                  <p className="font-cormorant-garamond mt-0.5 text-center text-[13px] uppercase leading-tight tracking-[0.04em] text-[#D4A437] sm:text-[14px] lg:text-[16px]">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}

