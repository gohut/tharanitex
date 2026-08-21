"use client";

import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  backgroundImage,
  backgroundColor = "#FBF5EA",
  rowCount = 1,
}) {
  // --------------------------------------------------
  // MOBILE — DYNAMIC CMS ROWS
  // --------------------------------------------------

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

        {/* ================================================= */}
        {/* SECTION HEADING */}
        {/* ================================================= */}

        <h2 className="text-center text-[34px] font-light text-[#D4A437] sm:text-[44px] md:text-[50px]">
          {title}
        </h2>

        {/* ================================================= */}
        {/* SECTION SUBTITLE */}
        {/* ================================================= */}

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

            const hasMoreProducts = rowProducts.length > 2;

            return (
              <div
                key={rowIndex}
                className="relative overflow-hidden"
              >

                {/* PRODUCT SCROLLER */}

                <div
                  className="
                    flex
                    gap-3
                    overflow-x-auto
                    scroll-smooth
                    snap-x
                    snap-mandatory
                    scrollbar-hide
                    pr-1
                    sm:gap-6
                    sm:pr-2
                  "
                >
                  {rowProducts.map((product) => (
                    <div
                      key={product.id}
                      className="
                        w-[calc((100%-12px)/2.08)]
                        min-w-[calc((100%-12px)/2.08)]
                        shrink-0
                        snap-start

                        sm:w-[calc((100%-24px)/2.08)]
                        sm:min-w-[calc((100%-24px)/2.08)]
                      "
                    >
                      <ProductCard
                        product={product}
                        isHomepageCard={true}
                      />
                    </div>
                  ))}
                </div>

                {/* VERY SUBTLE RIGHT EDGE FADE */}

                {hasMoreProducts && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      right-0
                      top-0
                      z-20
                      h-full
                      w-5
                      bg-gradient-to-l
                      from-[#FBF5EA]/75
                      via-[#FBF5EA]/25
                      to-transparent
                      sm:w-6
                    "
                    aria-hidden="true"
                  />
                )}

              </div>
            );
          })}

        </div>

        {/* ================================================= */}
        {/* DESKTOP PRODUCT SLIDER */}
        {/* ================================================= */}

        <div className="relative mt-4 hidden overflow-hidden md:mt-5 lg:mt-6 lg:block">

          {/* PRODUCT SCROLLER */}

          <div
            className="
              flex
              gap-x-6
              overflow-x-auto
              scroll-smooth
              snap-x
              snap-mandatory
              scrollbar-hide
              pb-2
              pr-2
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  w-[calc((100%-72px)/4.15)]
                  min-w-[calc((100%-72px)/4.15)]
                  shrink-0
                  snap-start
                "
              >
                <ProductCard
                  product={product}
                  isHomepageCard={true}
                />
              </div>
            ))}
          </div>

          {/* VERY SUBTLE RIGHT EDGE FADE */}

          {products.length > 4 && (
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                z-20
                h-full
                w-8
                bg-gradient-to-l
                from-[#FBF5EA]/75
                via-[#FBF5EA]/25
                to-transparent
              "
              aria-hidden="true"
            />
          )}

        </div>
      </div>
    </section>
  );
}