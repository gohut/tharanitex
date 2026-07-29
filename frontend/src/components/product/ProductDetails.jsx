"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="flex flex-col">

      <h1 className="max-w-[520px] font-serif uppercase text-[#C48B2A] text-[54px] leading-[1.05] tracking-tight">
        {product.name}
      </h1>

      <p className="mt-5 uppercase text-[#C48B2A] tracking-[4px] text-sm font-medium">
        {product.category}
      </p>

      <div className="mt-8 pb-8 border-b border-[#E8DED2]">

        <div className="flex items-end gap-4">

          <h2 className="text-[46px] font-medium">
            ₹{product.price}
          </h2>

          {product.originalPrice && (
            <>
              <span className="text-xl text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>

              <span className="rounded-full bg-[#F8E6BE] px-3 py-1 text-sm font-semibold text-[#9B6B00]">
                {discount}% OFF
              </span>
            </>
          )}

        </div>

      </div>

      <div className="mt-8 flex gap-4">

        <div className="flex h-14 border border-[#D6B36A]">

          <button
            onClick={() => qty > 1 && setQty(qty - 1)}
            className="flex w-14 items-center justify-center transition hover:bg-[#F7F1E8]"
          >
            <Minus size={18} />
          </button>

          <div className="flex w-14 items-center justify-center text-lg font-medium">
            {qty}
          </div>

          <button
            onClick={() => setQty(qty + 1)}
            className="flex w-14 items-center justify-center transition hover:bg-[#F7F1E8]"
          >
            <Plus size={18} />
          </button>

        </div>

        <button className="h-14 flex-1 border-2 border-[#D6B36A] font-semibold tracking-wide transition-all duration-300 hover:bg-[#D6B36A] hover:text-white">
          ADD TO CART
        </button>

      </div>

      <button className="mt-4 h-14 bg-[#F3A900] font-semibold tracking-wide transition-all duration-300 hover:bg-[#DE9800]">
        BUY NOW
      </button>

      <div className="mt-12">
        <ProductAccordion />
      </div>

    </div>
  );
}