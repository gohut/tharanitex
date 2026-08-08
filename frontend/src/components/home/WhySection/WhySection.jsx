export default function WhySection({ content, subtitle }) {
  if (!content) {
    return null;
  }

  const features = content.features || [];

  return (
    <section className="bg-[#fbf3e6] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-24">

        <div className="flex items-center justify-center">
          <div className="flex max-w-[470px] flex-col items-center text-center">

            <p className="font-montserrat text-[15px] font-normal uppercase tracking-[0.32em] text-[#d79a1e] sm:text-[20px]">
              WHY THARANI
            </p>

            <div className="mt-5 h-px w-[120px] bg-[#e0bd73]" />

            <h2 className="mt-5 whitespace-pre-line font-klaristha text-[3.2rem] leading-[0.98] tracking-[-0.03em] text-[#111111] sm:text-[5.4rem] lg:text-[6.25rem]">
              {content.heading || content.title}
            </h2>

            <div className="mt-5 h-px w-[245px] max-w-full bg-[#e0bd73]" />

            {(subtitle || content.subtitle) && (
              <p className="mt-6 max-w-[430px] whitespace-pre-line font-montserrat text-[0.98rem] font-normal leading-[1.42] text-[#1e1e1e] sm:text-[1.15rem] lg:text-[1.3rem]">
                {subtitle || content.subtitle}
              </p>
            )}

          </div>
        </div>

        <div className="border-t border-[#e0bd73] pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0 xl:pl-20">

          {features.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={
                index !== features.length - 1
                  ? "mb-7 border-b border-[#e0bd73] pb-7 sm:mb-12 sm:pb-12"
                  : ""
              }
            >
              <h3 className="font-modern-romance text-[2.25rem] leading-[0.95] text-[#4d4d4d] sm:text-[3.2rem] lg:text-[3.65rem]">
                {item.title}
              </h3>

              <p className="mt-3 max-w-[350px] whitespace-pre-line font-montserrat text-[0.96rem] leading-[1.34] text-[#555555] sm:mt-5 sm:text-[1.12rem] lg:text-[1.28rem]">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
