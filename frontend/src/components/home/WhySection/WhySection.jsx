import homeContent from "@/data/homeContent";

export default function WhySection() {
  const { whyTharani } = homeContent;

  return (
    <section className="bg-[#FBF5EA] py-28">

      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-24">

        {/* LEFT */}

        <div className="flex flex-col items-center justify-center text-center">

          <p className="uppercase tracking-[8px] text-[#C79A2B] text-sm mb-8">
            WHY THARANI
            </p>

            <h2 className="text-[64px] leading-[72px] font-light text-[#4D4D4D] whitespace-pre-line">
            {whyTharani.heading}
            </h2>

            <p className="mt-8 text-[#666] text-lg leading-7 whitespace-pre-line">
            {whyTharani.subtitle}
            </p>

        </div>

        {/* RIGHT */}

        <div className="border-l border-[#D4AF37] pl-14">

          {whyTharani.features.map((item, index) => (

            <div key={index} className="pb-10 mb-10">

              <h3 className="text-[34px] font-medium text-[#4F4F4F]">
                {item.title}
              </h3>

              <p className="mt-3 whitespace-pre-line text-[#666] leading-8">
                {item.description}
              </p>

              {index !== whyTharani.features.length - 1 && (
                <div className="border-b border-[#D4AF37] mt-8" />
              )}

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}