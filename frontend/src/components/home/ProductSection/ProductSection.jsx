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
  const safeRowCount = Math.max(1, Number(rowCount) || 1);

  // --------------------------------------------------
  // MOBILE / TABLET — DYNAMIC CMS ROWS
  // --------------------------------------------------

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
        {/* MOBILE / TABLET */}
        {/* ================================================= */}

        <div className="mt-3 space-y-6 sm:mt-4 sm:space-y-8 lg:hidden">

          {mobileRows.map((rowProducts, rowIndex) => {
            if (!rowProducts.length) {
              return null;
            }

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
                    sm:gap-6
                    pr-3
                    sm:pr-6
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

                {/* VERY SUBTLE SCROLL FADE */}

                {rowProducts.length > 2 && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      right-0
                      top-0
                      z-10
                      h-full
                      w-8
                      bg-gradient-to-l
                      from-[#FBF5EA]
                      to-transparent
                      sm:w-10
                    "
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* DESKTOP */}
        {/* ================================================= */}

        <div className="relative mt-4 hidden lg:block md:mt-5 lg:mt-6 overflow-hidden">

          {/* PRODUCT SCROLLER */}

          <div
            className="
              flex
              gap-x-10
              gap-y-12
              overflow-x-auto
              scroll-smooth
              snap-x
              snap-mandatory
              scrollbar-hide
              pb-2
              pr-8
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  min-w-[calc((100%-120px)/4)]
                  w-[calc((100%-120px)/4)]
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

          {/* VERY SUBTLE SCROLL FADE */}

          {products.length > 4 && (
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                z-10
                h-full
                w-12
                bg-gradient-to-l
                from-[#FBF5EA]
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