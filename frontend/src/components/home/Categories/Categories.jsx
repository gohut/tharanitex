import homeContent from "@/data/homeContent";

export default function Categories() {
  const { categories } = homeContent;

  return (
    <section className="bg-[#FBF5EA] py-16">
      <div className="max-w-[1440px] mx-auto px-10">

        <div className="text-center">
          <h2 className="text-[52px] font-light text-[#D4A437]">
            {categories.title}
          </h2>

          <p className="mt-2 text-sm text-[#666]">
            {categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8 mt-14">
          {categories.items.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[380px] object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-5 text-center text-[18px] tracking-wide text-[#666]">
                {item.title}
              </h3>

              <p className="text-center text-[#D4A437] text-sm tracking-[2px]">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center mt-14">
          <div className="flex-1 border-t border-[#D9CCB3]" />

          <span className="mx-8 text-[#777]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#D9CCB3]" />
        </div>

      </div>
    </section>
  );
}