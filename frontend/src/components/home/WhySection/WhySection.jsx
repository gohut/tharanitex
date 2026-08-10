export default function WhySection({ content, subtitle }) {
  if (!content) {
    return null;
  }

  const features = content.features || [];

  return (
    <section className="px-6 py-9 sm:px-8 sm:py-12">
      {/* Heading */}
      <div className="flex items-center justify-center">
        <div className="flex max-w-[470px] flex-col items-center text-center">
          <p className="font-montserrat text-[12px] font-normal uppercase tracking-[0.32em] text-[#d79a1e] sm:text-[20px]">
            WHY THARANI ?
          </p>

          <div className="mt-3 h-px w-[100px] bg-[#e0bd73] sm:mt-5 sm:w-[120px]" />

          <h2 className="mt-4 whitespace-pre-line font-klaristha text-[2rem] leading-[1] tracking-[-0.03em] text-[#111111] sm:mt-5 sm:text-[5.4rem] lg:text-[6.25rem]">
            {content.heading || content.title}
          </h2>

          <div className="mt-4 h-px w-[245px] max-w-full bg-[#e0bd73] sm:mt-5" />

          {(subtitle || content.subtitle) && (
            <p className="mt-4 max-w-[360px] whitespace-pre-line font-montserrat text-[0.78rem] font-normal leading-[1.4] text-[#1e1e1e] sm:mt-6 sm:text-[1.15rem] lg:text-[1.3rem]">
              {subtitle || content.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 border-t border-[#e0bd73] pt-7 sm:mt-10 sm:pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0 xl:pl-20">
        <div className="grid grid-cols-2 lg:block">
          {features.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={[
                // Mobile
                "text-center",
                index === 0
                  ? "border-r border-[#e0bd73] pr-4"
                  : "",
                index === 1
                  ? "pl-4"
                  : "",
                index === 2
                  ? "col-span-2 mt-8 border-t-0 pt-0"
                  : "",

                // Desktop - restore original vertical layout
                "lg:text-left",
                index !== features.length - 1
                  ? "lg:mb-7 lg:border-b lg:border-[#e0bd73] lg:pb-7"
                  : "",
                "lg:border-r-0 lg:pl-0 lg:pr-0",
              ].join(" ")}
            >
              <h3 className="font-modern-romance text-[1.85rem] leading-[0.95] text-[#4d4d4d] sm:text-[3.2rem] lg:text-[3.65rem]">
                {item.title}
              </h3>

              <p className="mx-auto mt-2 max-w-[155px] whitespace-pre-line font-montserrat text-[0.72rem] leading-[1.35] text-[#555555] sm:mt-5 sm:max-w-[350px] sm:text-[1.12rem] lg:mx-0 lg:mt-3 lg:text-[1.28rem]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}