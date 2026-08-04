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

  const visibleProducts = products.slice(
    startIndex,
    startIndex + visibleCount
  );

  return (
    <section className="bg-[#FBF5EA] py-20">
      <div className="max-w-[1400px] mx-auto px-8">

        <h2 className="text-center text-[50px] font-light text-[#D4A437]">
          {title}
        </h2>

        <div className="relative mt-14">

          {/* Left Arrow */}
          {products.length > visibleCount && (
            <button
              onClick={handlePrevious}
              disabled={!canGoLeft}
              className={`
                absolute
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
            {visibleProducts.map((product) => (
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
                absolute
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
        <div className="flex items-center mt-16">
          <div className="flex-1 border-t border-[#D8CCB4]" />

          <span className="mx-8 text-[#8A8175] text-[18px]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#D8CCB4]" />
        </div>

      </div>
    </section>
  );
}