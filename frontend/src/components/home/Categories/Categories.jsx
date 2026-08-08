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
          <h2 className="text-[34px] font-light leading-none text-[#D4A437] sm:text-[46px] md:text-[60px] lg:text-[68px]">
            {categories.title}
          </h2>

          {categories.subtitle && (
            <p className="mt-2 text-sm leading-6 text-[#72675A] md:mt-3 md:text-base">
              {categories.subtitle}
            </p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-5 lg:mt-6 lg:grid-cols-4 lg:gap-8">

          {items.map((item) => (
            <Link
              key={item.id}
              href={`/search?category=${encodeURIComponent(
                item.slug
              )}`}
              className="group flex h-full flex-col cursor-pointer"
            >
              <div className="overflow-hidden bg-white transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[360px] md:aspect-auto lg:h-[400px]"
                />
              </div>

              <div className="flex flex-1 flex-col items-center justify-start px-2 pb-1 pt-3 sm:pt-4 lg:pt-6">
                <h3 className="min-h-[2.75rem] text-center text-[14px] font-medium leading-5 tracking-wide text-[#4A433C] transition-colors duration-300 group-hover:text-[#B88718] sm:min-h-[3rem] sm:text-[17px] lg:text-[19px]">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="mt-1 text-center text-[10px] tracking-[0.12em] text-[#8A8175] sm:mt-2 sm:text-[13px] sm:tracking-[2px]">
                    {item.description}
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
