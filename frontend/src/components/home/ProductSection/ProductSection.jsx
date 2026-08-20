"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  backgroundImage,
  backgroundColor = "#FBF5EA",
  rowCount = 1,
}) {
  const visibleCount = 4;

  // Desktop slider
  const [startIndex, setStartIndex] = useState(0);

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

// --------------------------------------------------
// MOBILE — DYNAMIC CMS ROW SLIDERS
// --------------------------------------------------

const mobileVisibleCount = 2;
const mobileStep = 2;

const safeRowCount = Math.max(1, Number(rowCount) || 1);

const mobileRows = Array.from(
  { length: safeRowCount },
  (_, rowIndex) => {
    const rowSize = Math.ceil(products.length / safeRowCount);

    return products.slice(
      rowIndex * rowSize,
      (rowIndex + 1) * rowSize
    );
  }
);

const mobileRowRefs = useRef([]);

const [mobileRowIndexes, setMobileRowIndexes] = useState({});

const getRowIndex = (rowIndex) => {
  return mobileRowIndexes[rowIndex] || 0;
};

const setRowIndex = (rowIndex, value) => {
  setMobileRowIndexes((prev) => ({
    ...prev,
    [rowIndex]: value,
  }));
};

const handleMobilePrevious = (rowIndex) => {
  const currentIndex = getRowIndex(rowIndex);

  if (currentIndex <= 0) return;

  const nextIndex = Math.max(
    0,
    currentIndex - mobileStep
  );

  const container = mobileRowRefs.current[rowIndex];

  if (container) {
    container.scrollBy({
      left: -container.clientWidth,
      behavior: "smooth",
    });
  }

  setRowIndex(rowIndex, nextIndex);
};

const handleMobileNext = (rowIndex) => {
  const row = mobileRows[rowIndex];

  if (!row) return;

  const currentIndex = getRowIndex(rowIndex);

  const maxIndex = Math.max(
    0,
    row.length - mobileVisibleCount
  );

  if (currentIndex >= maxIndex) return;

  const nextIndex = Math.min(
    maxIndex,
    currentIndex + mobileStep
  );

  const container = mobileRowRefs.current[rowIndex];

  if (container) {
    container.scrollBy({
      left: container.clientWidth,
      behavior: "smooth",
    });
  }
  setRowIndex(rowIndex, nextIndex);
};


  return (
    <section
      className="bg-cover bg-center bg-no-repeat py-5 md:py-8 lg:py-10"
      style={{
        backgroundColor,
        ...(backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : {}),
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">

        {/* Section Heading */}
        <h2 className="text-center text-[34px] font-light text-[#D4A437] sm:text-[44px] md:text-[50px]">
          {title}
        </h2>

        {/* Section Subtitle */}
        {subtitle && (
          <p
            className={`mx-auto mt-2 max-w-2xl text-center text-sm leading-6 md:mt-3 md:text-base ${
              backgroundColor === "#003D2C"
                ? "text-[#F7F1E5]"
                : "text-[#72675A]"
            }`}
          >
            {subtitle}
          </p>
        )}


        {/* ================================================= */}
        {/* MOBILE / TABLET — DYNAMIC CMS ROWS */}
        {/* ================================================= */}

        <div className="mt-3 space-y-6 sm:mt-4 sm:space-y-8 lg:hidden">

          {mobileRows.map((rowProducts, rowIndex) => {
            if (!rowProducts.length) return null;

            const currentIndex =
              mobileRowIndexes[rowIndex] || 0;

            const canGoLeft = currentIndex > 0;

            const canGoRight =
              currentIndex + mobileVisibleCount <
              rowProducts.length;

            return (
              <div
                key={rowIndex}
                className="relative"
              >

                {/* PRODUCTS */}

                <div
                  ref={(el) => {
                    mobileRowRefs.current[rowIndex] = el;
                  }}
                  className="
                    flex
                    gap-3
                    overflow-x-auto
                    scroll-smooth
                    snap-x
                    snap-mandatory
                    scrollbar-hide
                    sm:gap-6
                  "
                >
                  {rowProducts.map((product) => (
                    <div
                      key={product.id}
                      className="
                        w-[calc((100%-12px)/2)]
                        min-w-[calc((100%-12px)/2)]
                        shrink-0
                        snap-start
                        sm:w-[calc((100%-24px)/2)]
                        sm:min-w-[calc((100%-24px)/2)]
                      "
                    >
                      <ProductCard
                        product={product}
                        isHomepageCard={true}
                      />
                    </div>
                  ))}
                </div>

                {/* LEFT ARROW */}

                {canGoLeft && (
                  <button
                    type="button"
                    onClick={() =>
                      handleMobilePrevious(rowIndex)
                    }
                    aria-label={`Previous products in row ${
                      rowIndex + 1
                    }`}
                    className="
                      absolute
                      left-0
                      top-[110px]
                      z-30
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      shadow-md
                      transition-transform
                      duration-200
                      hover:scale-105
                      active:scale-95
                      sm:top-[120px]
                      sm:h-8
                      sm:w-8
                    "
                  >
                    <ArrowLeft
                      size={18}
                      strokeWidth={1.8}
                      color="#D69E2E"
                    />
                  </button>
                )}

                {/* RIGHT ARROW */}

                {canGoRight && (
                  <button
                    type="button"
                    onClick={() =>
                      handleMobileNext(rowIndex)
                    }
                    aria-label={`Next products in row ${
                      rowIndex + 1
                    }`}
                    className="
                      absolute
                      right-0
                      top-[110px]
                      z-30
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      shadow-md
                      transition-transform
                      duration-200
                      hover:scale-105
                      active:scale-95
                      sm:top-[120px]
                      sm:h-8
                      sm:w-8
                    "
                  >
                    <ArrowRight
                      size={18}
                      strokeWidth={1.8}
                      color="#D69E2E"
                    />
                  </button>
                )}

              </div>
            );
          })}

        </div>

        {/* ================================================= */}
        {/* DESKTOP SLIDER â€” LEAVE AS IT IS */}
        {/* ================================================= */}

        <div className="relative mt-4 hidden lg:block md:mt-5 lg:mt-6">


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


