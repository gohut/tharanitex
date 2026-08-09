"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";
import toast from "react-hot-toast";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);
  const router = useRouter();

  async function addToCart() {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "guest",
          productId: product.id,
          quantity: qty,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success(`${product.name} added to cart`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to add product to cart.");
    }
  }

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col pt-1">
      <h1 className="max-w-[520px] font-klaristha text-[24px] uppercase leading-[1.05] tracking-[-0.01em] text-[#C79127] sm:text-[28px] md:text-[36px]">
        {product.name}
      </h1>

      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      <div className="mt-4 border-b border-[#E4D9C6] pb-4">
        <p className="text-[22px] font-medium text-[#2E241B] md:text-[26px]">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-11 w-fit border border-[#F2A100] sm:h-[50px]">
          <button
            onClick={() => qty > 1 && setQty(qty - 1)}
            className="flex w-9 items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600] sm:w-11"
          >
            <Minus size={14} />
          </button>

          <div className="flex w-9 items-center justify-center bg-[#F7E8C5] text-sm font-medium text-[#3F2C12] sm:w-11 sm:text-base">
            {qty}
          </div>

          <button
            onClick={() => setQty(qty + 1)}
            className="flex w-9 items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600] sm:w-11"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={addToCart}
          className="h-11 flex-1 border-2 border-[#F2A100] bg-[#F2A100] px-6 text-sm font-semibold tracking-[0.06em] text-[#2F2417] transition hover:bg-[#DF9600] sm:h-[50px]"
        >
          ADD TO CART
        </button>
      </div>

      <button className="mt-3 h-11 w-full border-2 border-[#5A1F2F] bg-[#5A1F2F] text-sm font-semibold tracking-[0.06em] text-white transition hover:bg-[#471825] sm:h-[50px]">
        BUY NOW
      </button>

      <div className="mt-5">
        <ProductAccordion />
      </div>
    </div>
  );
}
