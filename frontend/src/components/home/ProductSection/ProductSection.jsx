"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  backgroundImage,
}) {
  const visibleCount = 4;
  const [startIndex, setStartIndex] = useState(0);
  const mobileVisibleCount = 4;
  const mobileStep = 2;

  const [mobileStartIndex, setMobileStartIndex] = useState(0);

  const canGoMobileLeft = mobileStartIndex > 0;

  const canGoMobileRight =
    mobileStartIndex + mobileVisibleCount < products.length;

  const handleMobilePrevious = () => {
    if (canGoMobileLeft) {
      setMobileStartIndex((prev) => Math.max(0, prev - mobileStep));
    }
  };

  const handleMobileNext = () => {
    if (canGoMobileRight) {
      setMobileStartIndex((prev) => prev + mobileStep);
    }
  };

    const canGoLeft = startIndex > 0;
    const canGoRight = startIndex + visibleCount < products.length;

    const hasSlider = products.length > visibleCount;

    const handlePrevious = () => {
      if (canGoLeft) {
        setStartIndex((prev) => prev - 1);
      }
    };

    const handleNext = () => {
      if (canGoRight) {
        setStartIndex((prev) => prev + 1);
      }
    };

  return (
    <section className="bg-[#003D2C] py-5 md:py-8 lg:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">

        {/* Section Heading */}
        <h2 className="text-center text-[34px] font-light text-[#D4A437] sm:text-[44px] md:text-[50px]">
          {title}
        </h2>

        {/* Section Subtitle */}
        {subtitle && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-[#F7F1E5] md:mt-3 md:text-base">
            {subtitle}
          </p>
        )}

        {/* Mobile / Tablet Slider */}
        <div className="relative mt-3 sm:mt-4 lg:hidden">

          {/* LEFT FADE */}
          {canGoMobileLeft && (
            <div
              className="
                pointer-events-none
                absolute
                left-0
                top-0
                bottom-0
                z-20
                w-12
                bg-gradient-to-r
                from-[#FBF5EA]
                to-transparent
              "
            />
          )}

          {/* RIGHT FADE */}
          {canGoMobileRight && (
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                bottom-0
                z-20
                w-12
                bg-gradient-to-l
                from-[#FBF5EA]
                to-transparent
              "
            />
          )}

          {/* LEFT ARROW */}
          {canGoMobileLeft && (
            <button
              type="button"
              onClick={handleMobilePrevious}
              aria-label="Previous products"
              className="
                absolute
                left-1
                top-[40%]
                z-30
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-md
              "
            >
              <ArrowLeft
                size={17}
                strokeWidth={1.8}
                color="#D69E2E"
              />
            </button>
          )}

          {/* PRODUCTS */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {products
              .slice(
                mobileStartIndex,
                mobileStartIndex + mobileVisibleCount
              )
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isHomepageCard={true}
                />
              ))}
          </div>

          {/* RIGHT ARROW */}
          {canGoMobileRight && (
            <button
              type="button"
              onClick={handleMobileNext}
              aria-label="Next products"
              className="
                absolute
                right-1
                top-[40%]
                z-30
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-md
              "
            >
              <ArrowRight
                size={17}
                strokeWidth={1.8}
                color="#D69E2E"
              />
            </button>
          )}

        </div>

        {/* Desktop Slider */}
        <div className="relative mt-4 hidden lg:block md:mt-5 lg:mt-6">

          {/* LEFT FADE */}
          {hasSlider && canGoLeft && (
            <div
              className="
                pointer-events-none
                absolute
                left-0
                top-0
                bottom-0
                z-30
                w-28
                bg-gradient-to-r
                from-[#FBF5EA]/90
                via-[#FBF5EA]/60
                to-transparent
              "
            />
          )}

          {/* RIGHT FADE */}
          {hasSlider && canGoRight && (
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                bottom-0
                z-30
                w-28
                bg-gradient-to-l
                from-[#FBF5EA]/90
                via-[#FBF5EA]/60
                to-transparent
              "
            />
          )}

          {/* LEFT ARROW */}
          {hasSlider && canGoLeft && (
            <button
              onClick={handlePrevious}
              aria-label="Previous products"
              className="
                absolute
                left-3
                top-[40%]
                z-40
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-105
                active:scale-95
              "
            >
              <ArrowLeft
                size={20}
                strokeWidth={1.8}
                color="#D69E2E"
              />
            </button>
          )}

          {/* PRODUCTS */}
          <div
            className="
              grid
              grid-cols-4
              gap-x-10
              gap-y-12
            "
          >
            {products
              .slice(startIndex, startIndex + visibleCount)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isHomepageCard={true}
                />
              ))}
          </div>

          {/* RIGHT ARROW */}
          {hasSlider && canGoRight && (
            <button
              onClick={handleNext}
              aria-label="Next products"
              className="
                absolute
                right-3
                top-[40%]
                z-40
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-105
                active:scale-95
              "
            >
              <ArrowRight
                size={20}
                strokeWidth={1.8}
                color="#D69E2E"
              />
            </button>
          )}

        </div>
      </div>
    </section>
  );
}