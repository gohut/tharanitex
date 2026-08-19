"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";
import toast from "react-hot-toast";
import CheckoutModal from "@/components/Cart/CheckoutModal";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const router = useRouter();

  async function addToCart() {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
      <h1 className="max-w-[520px] font-klaristha text-[26px] uppercase leading-[1.05] tracking-[-0.01em] text-[#C79127] sm:text-[28px] md:text-[36px]">
        {product.name}
      </h1>

      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      <div className="mt-4 flex items-center justify-between border-b border-[#E4D9C6] pb-4">
        <p className="text-[22px] font-medium text-[#2E241B] md:text-[26px]">
          {formatPrice(product.price)}
        </p>

        <div className="flex h-[22px] shrink-0 border border-[#F2A100]">
          <button
            onClick={() => qty > 1 && setQty(qty - 1)}
            aria-label="Decrease quantity"
            className="flex w-[22px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600]"
          >
            <Minus size={10} strokeWidth={2.5} />
          </button>

          <div className="flex w-[22px] items-center justify-center bg-[#F7E8C5] text-[11px] font-medium leading-none text-[#3F2C12]">
            {qty}
          </div>

          <button
            onClick={() => setQty(qty + 1)}
            aria-label="Increase quantity"
            className="flex w-[22px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600]"
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={addToCart}
          className="h-11 w-full border-2 border-[#F2A100] bg-[#F2A100] px-6 text-sm font-semibold tracking-[0.06em] text-[#2F2417] transition hover:bg-[#DF9600] sm:h-[50px]"
        >
          ADD TO BAG
        </button>
      </div>

      <button onClick={() => setIsCheckoutOpen(true)} className="mt-3 h-11 w-full border-2 border-[#5A1F2F] bg-[#5A1F2F] text-sm font-semibold tracking-[0.06em] text-white transition hover:bg-[#471825] sm:h-[50px]">
        BUY NOW
      </button>

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutType="BUY_NOW"
        buyNowItem={{ productId: product.id, quantity: qty }}
        onOrderCreated={(order) => router.push(`/orders/${order.orderId}`)}
      />

      <div className="mt-5">
        <ProductAccordion />
      </div>
    </div>
  );
}
