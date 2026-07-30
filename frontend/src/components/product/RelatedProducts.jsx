"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ products }) {
  const scrollerRef = useRef(null);

  const scrollCards = (direction) => {
    if (!scrollerRef.current) {
      return;
    }

    const amount = Math.min(scrollerRef.current.clientWidth * 0.9, 1100);
    scrollerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-t border-[#E6D9C6] pt-12">
      <div className="mx-auto max-w-[1420px] px-5 md:px-8 lg:px-10">
        <h2 className="text-center font-klaristha text-[34px] uppercase tracking-[0.02em] text-[#D38E2E] md:text-[46px]">
          You May Also Like
        </h2>

        <div className="relative mt-10">
          <button
            onClick={() => scrollCards("left")}
            aria-label="Previous related products"
            className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[calc(50%-10px)] flex-none md:min-w-[calc((100%-40px)/3)] xl:min-w-[calc((100%-60px)/4)]"
              >
                <RelatedCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollCards("right")}
            aria-label="Next related products"
            className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden border border-[#E6D9C6] bg-[#F7EFE3]">
        <div className="relative aspect-[0.85] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className={`absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            wishlisted ? "bg-[#5B2333]" : "bg-white"
          }`}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={32}
            height={32}
            className={`object-contain transition-all duration-300 ${
              wishlisted ? "brightness-0 invert" : ""
            }`}
          />
        </button>
      </div>

      <h3 className="mt-3 line-clamp-2 text-[15px] leading-snug text-[#5A4A39] transition-colors group-hover:text-[#C79127]">
        {product.name}
      </h3>

      <p className="mt-1 text-[15px] font-medium text-[#D38E2E]">
        {formatPrice(product.price)}
      </p>
    </div>
  );
}
