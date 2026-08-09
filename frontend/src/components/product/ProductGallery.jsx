"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-[0.82] w-full overflow-hidden border border-[#E8DDCE] bg-[#F4EBDD] sm:aspect-[0.78]">
        <Image
          src={images[selected]}
          alt="Product"
          fill
          priority
          unoptimized
          className="object-cover"
        />

        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className={`absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 sm:h-9 sm:w-9 ${
            wishlisted ? "bg-[#5B2333]" : "bg-white"
          }`}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={18}
            height={18}
            className={`object-contain transition-all duration-300 ${
              wishlisted ? "brightness-0 invert" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative h-[68px] w-[56px] shrink-0 overflow-hidden border transition sm:h-[74px] sm:w-[62px] ${
              selected === index
                ? "border-[#C79127]"
                : "border-[#E5D8C7] hover:border-[#C79127]"
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
