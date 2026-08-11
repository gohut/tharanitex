"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Categories({ categories }) {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  if (!categories) {
    return null;
  }

  const items = categories.items || [];

  if (!items.length) {
    return null;
  }

  const updateScrollButtons = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    setCanScrollLeft(slider.scrollLeft > 5);
    setCanScrollRight(
      slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 5
    );
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    updateScrollButtons();

    slider.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      slider.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items.length]);

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector("[data-category-card]");

    if (!card) return;

    const gap = 32;

    const scrollAmount = card.offsetWidth + gap;

    slider.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#FBF5EA] py-5 md:py-8 lg:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-12">

        {/* Heading */}
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

        {/* Slider */}
        <div className="relative mt-3 sm:mt-4 lg:mt-6">

          {/* Left Button */}
          <button
            type="button"
            onClick={() => scrollSlider("left")}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className={`absolute left-1 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#4A433C]/30 bg-[#FBF5EA]/90 text-2xl text-[#4A433C] shadow-sm backdrop-blur-sm transition-all md:flex ${
              canScrollLeft
                ? "cursor-pointer opacity-100 hover:bg-[#4A433C] hover:text-white"
                : "pointer-events-none opacity-0"
            }`}
          >
            ‹
          </button>

          {/* Cards */}
          <div
            ref={sliderRef}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide sm:gap-5 lg:gap-8"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/collections/${item.slug}`}
                data-category-card
                className="group flex w-[72vw] shrink-0 snap-start cursor-pointer flex-col sm:w-[44vw] lg:w-[calc((100%-96px)/4)]"
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

            {/* VIEW MORE */}
            <Link
              href="/collections"
              data-category-card
              className="group flex w-[72vw] shrink-0 snap-start cursor-pointer flex-col sm:w-[44vw] lg:w-[calc((100%-96px)/4)]"
            >
              <div className="flex aspect-[3/4] items-center justify-center border border-[#D4A437]/40 bg-[#F7EEDC] transition-all duration-500 group-hover:bg-[#4A433C] md:h-[360px] md:aspect-auto lg:h-[400px]">
                <div className="text-center">
                  <span className="font-cormorant-garamond block text-[25px] uppercase tracking-[0.08em] text-[#4A433C] transition-colors duration-300 group-hover:text-[#FBF5EA] sm:text-[28px] lg:text-[32px]">
                    View More
                  </span>

                  <span className="mt-2 block text-2xl text-[#D4A437] transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>

              <div className="flex flex-1 items-start justify-center px-2 pb-1 pt-3 sm:pt-4 lg:pt-5">
                <h3 className="font-cormorant-garamond text-center text-[22px] font-medium uppercase leading-tight tracking-[0.04em] text-[#4A433C] sm:text-[24px] lg:text-[27px]">
                  View More
                </h3>
              </div>
            </Link>
          </div>

          {/* Right Button */}
          <button
            type="button"
            onClick={() => scrollSlider("right")}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className={`absolute right-1 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#4A433C]/30 bg-[#FBF5EA]/90 text-2xl text-[#4A433C] shadow-sm backdrop-blur-sm transition-all md:flex ${
              canScrollRight
                ? "cursor-pointer opacity-100 hover:bg-[#4A433C] hover:text-white"
                : "pointer-events-none opacity-0"
            }`}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}