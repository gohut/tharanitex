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
  // MOBILE — TWO INDEPENDENT ROW SLIDERS
  // --------------------------------------------------

  const mobileVisibleCount = 2;
  const mobileStep = 2;

  /*
   * Split the products into two rows.
   *
   * Example with 8 products:
   *
   * Row 1 → 1  2  3  4
   * Row 2 → 5  6  7  8
   */
  const mobileRowSize = Math.ceil(products.length / 2);

  const mobileRow1Products = products.slice(0, mobileRowSize);
  const mobileRow2Products = products.slice(mobileRowSize);

  const [mobileRow1Index, setMobileRow1Index] = useState(0);
  const [mobileRow2Index, setMobileRow2Index] = useState(0);

  const mobileRow1Ref = useRef(null);
  const mobileRow2Ref = useRef(null);

  const scrollMobileRow = (ref) => {
    ref.current?.scrollBy({
      left: ref.current.clientWidth,
      behavior: "smooth",
    });
  };

  // Row 1 controls
  const row1CanGoLeft = mobileRow1Index > 0;

  const row1CanGoRight =
    mobileRow1Index + mobileVisibleCount <
    mobileRow1Products.length;

  // Row 2 controls
  const row2CanGoLeft = mobileRow2Index > 0;

  const row2CanGoRight =
    mobileRow2Index + mobileVisibleCount <
    mobileRow2Products.length;

  const handleMobileRow1Previous = () => {
    if (row1CanGoLeft) {
      setMobileRow1Index((prev) =>
        Math.max(0, prev - mobileStep)
      );
    }
  };

  const handleMobileRow1Next = () => {
    if (row1CanGoRight) {
      setMobileRow1Index((prev) =>
        Math.min(
          mobileRow1Products.length - mobileVisibleCount,
          prev + mobileStep
        )
      );
    }
  };

  const handleMobileRow2Previous = () => {
    if (row2CanGoLeft) {
      setMobileRow2Index((prev) =>
        Math.max(0, prev - mobileStep)
      );
    }
  };

  const handleMobileRow2Next = () => {
    if (row2CanGoRight) {
      setMobileRow2Index((prev) =>
        Math.min(
          mobileRow2Products.length - mobileVisibleCount,
          prev + mobileStep
        )
      );
    }
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
        {/* MOBILE / TABLET — TWO INDEPENDENT SCROLLABLE ROWS */}
        {/* ================================================= */}

        <div className="mt-3 space-y-6 sm:mt-4 sm:space-y-8 lg:hidden">

          {/* ================= ROW 1 ================= */}

          <div className="relative">

            <div
              ref={mobileRow1Ref}
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
              {mobileRow1Products.map((product) => (
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

            {/* Row 1 Arrow */}
            {mobileRow1Products.length > mobileVisibleCount && (
              <button
                type="button"
                onClick={() => scrollMobileRow(mobileRow1Ref)}
                aria-label="Next products in first row"
                className="
                  absolute
                  right-0
                  top-[28%]
                  z-30
                  flex
                  h-10
                  w-10
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
                  sm:h-10
                  sm:w-10
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


          {/* ================= ROW 2 ================= */}

          {mobileRow2Products.length > 0 && (
            <div className="relative">

              <div
                ref={mobileRow2Ref}
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
                {mobileRow2Products.map((product) => (
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

              {/* Row 2 Arrow */}
              {mobileRow2Products.length > mobileVisibleCount && (
                <button
                  type="button"
                  onClick={() => scrollMobileRow(mobileRow2Ref)}
                  aria-label="Next products in second row"
                  className="
                    absolute
                    right-0
                    top-[28%]
                    z-30
                    flex
                    h-10
                    w-10
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
                    sm:h-10
                    sm:w-10
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
          )}

        </div>

        {/* ================================================= */}
        {/* DESKTOP SLIDER — LEAVE AS IT IS */}
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
