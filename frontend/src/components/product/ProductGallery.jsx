"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const showPrevious = () =>
    setSelected((current) => (current === 0 ? images.length - 1 : current - 1));
  const showNext = () =>
    setSelected((current) => (current === images.length - 1 ? 0 : current + 1));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[0.78] w-full overflow-hidden border border-[#E8DDCE] bg-[#F4EBDD]">
        <Image
          src={images[selected]}
          alt="Product"
          fill
          priority
          className="object-cover"
        />

        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
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

        <button
          onClick={showPrevious}
          aria-label="Previous product image"
          className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={showNext}
          aria-label="Next product image"
          className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative h-[74px] w-[62px] overflow-hidden border transition ${
              selected === index
                ? "border-[#C79127]"
                : "border-[#E5D8C7] hover:border-[#C79127]"
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
