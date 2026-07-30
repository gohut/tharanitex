"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col pt-1">
      <h1 className="max-w-[520px] font-klaristha text-[38px] uppercase leading-[0.95] tracking-[-0.02em] text-[#C79127] md:text-[54px]">
        {product.name}
      </h1>

      <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      <div className="mt-5 border-b border-[#E4D9C6] pb-5">
        <p className="text-[34px] font-medium text-[#2E241B] md:text-[38px]">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-[50px] w-full border border-[#F2A100] sm:w-auto">
          <button
            onClick={() => qty > 1 && setQty(qty - 1)}
            className="flex w-[50px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600]"
          >
            <Minus size={18} />
          </button>

          <div className="flex w-[50px] items-center justify-center bg-[#F7E8C5] text-base font-medium text-[#3F2C12]">
            {qty}
          </div>

          <button
            onClick={() => setQty(qty + 1)}
            className="flex w-[50px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600]"
          >
            <Plus size={18} />
          </button>
        </div>

        <button className="h-[50px] flex-1 border-2 border-[#F2A100] bg-transparent px-6 text-sm font-semibold tracking-[0.06em] text-[#3C3128] transition hover:bg-[#F9E2AC]">
          ADD TO CART
        </button>
      </div>

      <button className="mt-3 h-[50px] w-full bg-[#F2A100] text-sm font-semibold tracking-[0.06em] text-[#2F2417] transition hover:bg-[#DF9600]">
        BUY NOW
      </button>

      <div className="mt-5">
        <ProductAccordion />
      </div>
    </div>
  );
}
