"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function ProductSection({
  title,
  products = [],
}) {
  const visibleCount = 4;
  const [startIndex, setStartIndex] = useState(0);

  const canGoLeft = startIndex > 0;
  const canGoRight =
    startIndex + visibleCount < products.length;

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
    <section className="bg-[#FBF5EA] py-10 md:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">

        <h2 className="text-center text-[34px] font-light text-[#D4A437] sm:text-[44px] md:text-[50px]">
          {title}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 lg:hidden">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <div className="relative mt-8 hidden lg:block md:mt-14">

          {/* Left Arrow */}
          {products.length > visibleCount && (
            <button
              onClick={handlePrevious}
              disabled={!canGoLeft}
              className={`
                absolute hidden lg:flex
                left-[-24px]
                top-[40%]
                -translate-y-1/2
                z-50
                w-12 h-12
                rounded-full
                bg-white
                shadow-lg
                flex items-center justify-center
                transition
                ${
                  canGoLeft
                    ? "hover:scale-105 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }
              `}
              aria-label="Previous products"
            >
              <ArrowLeft
                size={20}
                color="#D69E2E"
              />
            </button>
          )}

          {/* Products */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-12">
            {products.slice(startIndex, startIndex + visibleCount).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* Right Arrow */}
          {products.length > visibleCount && (
            <button
              onClick={handleNext}
              disabled={!canGoRight}
              className={`
                absolute hidden lg:flex
                right-[-24px]
                top-[40%]
                -translate-y-1/2
                z-50
                w-12 h-12
                rounded-full
                bg-white
                shadow-lg
                flex items-center justify-center
                transition
                ${
                  canGoRight
                    ? "hover:scale-105 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }
              `}
              aria-label="Next products"
            >
              <ArrowRight
                size={20}
                color="#D69E2E"
              />
            </button>
          )}

        </div>

        {/* Divider */}
        <div className="mt-10 flex items-center md:mt-16">
          <div className="flex-1 border-t border-[#D8CCB4]" />

          <span className="mx-4 whitespace-nowrap text-[13px] text-[#8A8175] sm:mx-8 sm:text-[18px]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#D8CCB4]" />
        </div>

      </div>
    </section>
  );
}
