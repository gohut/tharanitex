"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group">

        <div className="relative overflow-hidden bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.02]"        />

        {/* Wishlist */}
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
              ${wishlisted ? "bg-[#5B2333]" : "bg-white"}
            `}
          >
            <img
              src="/assets/wishlist_icon.png"
              alt="Wishlist"
              className={`
                w-8 h-8 object-contain transition-all duration-300
                ${wishlisted ? "brightness-0 invert" : ""}
              `}
            />
        </button>

        {/* Cart */}
        <button
          className="
            absolute bottom-3 right-3 z-20
            w-10 h-10
            rounded-full
            bg-white
            shadow-md
            flex items-center justify-center
            transition-all duration-300
            hover:bg-[#5B2333]
            hover:text-white
            hover:scale-110
            active:scale-95
          "
        >
          <ShoppingBag size={20} strokeWidth={2} />
        </button>

      </div>

      <h3 className="mt-4 text-[15px] font-normal text-[#444] leading-6">
        {product.name}
      </h3>

      <p className="mt-1 text-[10px] uppercase tracking-[2px] text-[#B98E2A]">
        {product.category}
      </p>

      <p className="mt-2 text-[20px] font-medium text-[#D59B23]">
        {product.price}
      </p>

    </div>
  );
}