import homeContent from "@/data/homeContent";

export default function WhySection() {
  const { whyTharani } = homeContent;

  return (
    <section className="bg-black py-24">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2">

        {/* LEFT */}

        <div className="flex flex-col justify-center items-center border-r border-[#D4AF37]">

          <h2 className="text-[#D4AF37] text-[58px] tracking-[14px] font-light uppercase">
            {whyTharani.title}
          </h2>

          <div className="w-48 h-[2px] bg-[#D4AF37] mt-10" />

          <div className="flex-1" />

          <div className="w-96 h-[2px] bg-[#D4AF37]" />

        </div>

        {/* RIGHT */}

        <div className="px-28">

          {whyTharani.features.map((item, index) => (

            <div key={index} className="py-14">

              <h3 className="text-[#5A5A5A] text-[54px] font-light">
                {item.title}
              </h3>

              <p className="mt-5 whitespace-pre-line text-[#6B6B6B] text-[24px] leading-[42px] max-w-lg">
                {item.description}
              </p>

              {index !== whyTharani.features.length - 1 && (
                <div className="border-b border-[#D4AF37] mt-12" />
              )}

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}