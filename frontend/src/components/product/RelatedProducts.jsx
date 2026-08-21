"use client";

import {
  useEffect,
  useRef,
} from "react";

import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function RelatedProducts({
  products = [],
}) {
  const scrollerRef =
    useRef(null);

  useEffect(() => {
    const element =
      scrollerRef.current;

    if (!element) {
      return;
    }

    const handleWheel = (
      event
    ) => {
      if (
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX)
      ) {
        element.scrollLeft +=
          event.deltaY;
      }
    };

    element.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: true,
      }
    );

    return () => {
      element.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  if (!products.length) {
    return null;
  }

  return (
    <section className="bg-[#FBF5EA] pb-14 pt-8 sm:pb-16 sm:pt-10">

      <div className="mx-auto max-w-[1420px]">

        {/* TITLE */}
        <div className="px-5 md:px-8 lg:px-10">
          <h2
            className="
              text-center
              font-klaristha
              text-[34px]
              uppercase
              tracking-[0.02em]
              text-[#D4A437]
              md:text-[46px]
            "
          >
            You May Also Like
          </h2>
        </div>

        {/* PRODUCT STRIP */}
        <div
          ref={scrollerRef}
          className="
            relative
            mt-6
            flex
            gap-4
            overflow-x-auto
            scroll-smooth
            px-5
            pb-4
            md:gap-6
            md:px-8
            lg:px-10
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map(
            (product) => (
              <div
                key={product.id}
                className="
                  w-[calc(50vw-30px)]
                  min-w-[calc(50vw-30px)]
                  shrink-0

                  sm:w-[calc(33.333vw-32px)]
                  sm:min-w-[calc(33.333vw-32px)]

                  lg:w-[calc(25vw-32px)]
                  lg:min-w-[calc(25vw-32px)]

                  xl:w-[calc((1420px-72px)/4)]
                  xl:min-w-[calc((1420px-72px)/4)]
                "
              >
                <ProductCard
                  product={product}
                  isHomepageCard={true}
                />
              </div>
            )
          )}
        </div>

        {/* FADED RIGHT CONTINUATION */}
        <div className="pointer-events-none relative -mt-8 h-12">

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-24
              bg-gradient-to-l
              from-[#FBF5EA]
              to-transparent
            "
          />

        </div>
      </div>
    </section>
  );
}