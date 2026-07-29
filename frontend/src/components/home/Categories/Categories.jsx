import homeContent from "@/data/homeContent";

export default function Categories() {
  const { categories } = homeContent;

  return (
    <section className="bg-[#FBF5EA] py-24 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-[42px] md:text-[48px] lg:text-[52px] font-light text-[#D4A437] leading-tight">
            {categories.title}
          </h2>

          <p className="mt-4 text-[15px] md:text-base leading-7 text-[#72675A]">
            {categories.subtitle}
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mt-16">

          {categories.items.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[300px] md:h-[360px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-6 text-center text-[19px] font-medium tracking-wide text-[#4A433C] transition-colors duration-300 group-hover:text-[#B88718]">
                {item.title}
              </h3>

              <p className="mt-2 text-center text-[13px] tracking-[3px] uppercase text-[#C79C32]">
                {item.subtitle}
              </p>
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className="flex items-center mt-20">
          <div className="flex-1 border-t border-[#DCCFB8]" />

          <span className="mx-8 text-sm tracking-[0.25em] uppercase text-[#8A7A65]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#DCCFB8]" />
        </div>

      </div>
    </section>
  );
}