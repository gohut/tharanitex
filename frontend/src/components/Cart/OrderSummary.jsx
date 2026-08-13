"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutModal from "./CheckoutModal";

export default function OrderSummary({
  subtotal = "₹5,730",
  shipping = "Free",
  tax = "Calculated at checkout",
  total = "₹5,730",
  isCartEmpty = false,
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-sm border border-[#E8DCCB] bg-[#FFF7E9] shadow-sm">

      <div className="p-5 pb-0 sm:p-8 sm:pb-0">
        <h2 className="text-[26px] font-serif text-[#5A1F2F] sm:text-[30px]">
          Order Summary
        </h2>

        <div className="mt-6 space-y-4 pb-6 sm:mt-8 sm:space-y-5 sm:pb-8">

          <div className="flex justify-between text-base sm:text-[18px]">
            <span className="text-[#5F5F5F]">Subtotal</span>
            <span>{subtotal}</span>
          </div>

          <div className="flex justify-between text-base sm:text-[18px]">
            <span className="text-[#5F5F5F]">Shipping</span>
            <span>{shipping}</span>
          </div>

          <div className="flex justify-between text-base sm:text-[18px]">
            <span className="text-[#5F5F5F]">Taxes</span>
            <span className="text-sm text-gray-500">{tax}</span>
          </div>

        </div>
      </div>

      {/* Sticks to the bottom of THIS card only while it's in view; never floats over the whole page */}
      <div className="sticky bottom-0 z-10 border-t border-[#DCC9A3] bg-[#FFF7E9] px-5 py-5 sm:px-8 sm:py-6">

        <div className="flex items-center justify-between">
          <span className="text-[20px] font-medium text-[#5A1F2F] sm:text-[24px]">
            Grand Total
          </span>

          <span className="text-[26px] font-semibold text-[#5A1F2F] sm:text-[34px]">
            {total}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCheckoutOpen(true)}
          disabled={isCartEmpty}
          className="
            w-full
            mt-5 sm:mt-6
            h-14
            bg-[#D49E28]
            hover:bg-[#BF8C20]
            text-black
            font-semibold
            text-lg
            transition-all
            duration-300
            rounded-sm disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Proceed to Checkout →
        </button>

        <p className="mt-3 text-center text-xs text-[#7B7367] sm:text-sm">
          Taxes and shipping calculated at checkout.
        </p>
      </div>

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={() => router.push("/orders")}
      />

    </div>
  );
}
