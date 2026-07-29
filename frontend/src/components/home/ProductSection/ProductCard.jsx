"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(true);

  return (
    <div className="group transition-all duration-300 hover:-translate-y-1">

      <div className="relative overflow-hidden rounded-sm shadow-sm group-hover:shadow-xl transition-all duration-300">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[315px] object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Remove from Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className={`
            absolute top-3 right-3 z-20
            w-10 h-10
            rounded-full
            flex items-center justify-center
            shadow-md
            transition-all duration-300
            hover:scale-110
            active:scale-95
            ${
              wishlisted
                ? "bg-[#5B2333]"
                : "bg-white"
            }
          `}
        >
          <img
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            className={`
              w-8 h-8
              object-contain
              transition-all duration-300
              ${
                wishlisted
                  ? "brightness-0 invert"
                  : ""
              }
            `}
          />
        </button>

        {/* Add to Cart */}
        <button
          className="
            absolute
            bottom-3
            right-3
            z-20
            w-10
            h-10
            rounded-full
            bg-white
            shadow-md
            flex
            items-center
            justify-center
            transition-all
            duration-300
            hover:bg-[#5B2333]
            hover:text-white
            hover:scale-110
            active:scale-95
          "
        >
          <ShoppingBag size={20} strokeWidth={2} />
        </button>

      </div>

      <h3 className="mt-4 text-[16px] font-medium text-[#4B4B4B] leading-snug">
        {product.name}
      </h3>

      <p className="uppercase text-[10px] tracking-[1.6px] text-[#C39A32] mt-1">
        {product.category}
      </p>

      <p className="mt-1 text-[30px] text-[#D49E28] font-medium">
        {product.price}
      </p>

    </div>
  );
}