"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";
import ProductAccordion from "./ProductAccordion";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="flex flex-col">

      <h1 className="max-w-[520px] font-serif uppercase text-[#C48B2A] text-[48px] leading-[1.05] tracking-tight">
        {product.name}
      </h1>

      <p className="mt-4 uppercase text-[#C48B2A] tracking-[4px] text-sm font-medium">
        {product.category}
      </p>

      <div className="mt-8 pb-8 border-b border-[#E8DED2]">

        <div className="flex items-end gap-4">

          <h2 className="text-[42px] font-semibold text-[#1F1F1F]">
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

        <button className="h-14 flex-1  border-2 border-[#D6B36A] font-semibold tracking-[2px] transition-all duration-300 hover:bg-[#D6B36A] hover:text-white">
          ADD TO CART
        </button>

      </div>

      <button className="mt-4 h-14 bg-[#F3A900] font-semibold tracking-[2px] text-white transition-all duration-300 hover:bg-[#DE9800]">
        BUY NOW
      </button>

      <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-[#555]">

        <div className="flex items-center gap-2">
          <Truck size={18} className="text-[#C48B2A]" />
          <span>Free Shipping</span>
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="text-[#C48B2A]" />
          <span>Easy Returns</span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#C48B2A]" />
          <span>Secure Payment</span>
        </div>

        <div className="flex items-center gap-2">
          <BadgeCheck size={18} className="text-[#C48B2A]" />
          <span>Authentic Silk</span>
        </div>

      </div>

     <div className="mt-12">
      <ProductAccordion />
     </div>

    </div>
  );
}