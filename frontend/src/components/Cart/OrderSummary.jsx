"use client";

export default function OrderSummary({
  subtotal = "₹5,730",
  shipping = "Free",
  tax = "Calculated at checkout",
  total = "₹5,730",
}) {
  return (
    <div className="rounded-sm border border-[#E8DCCB] bg-[#FFF7E9] p-5 shadow-sm sm:p-8">

      <h2 className="text-[26px] font-serif text-[#5A1F2F] sm:text-[30px]">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">

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

        <div className="border-t border-[#DCC9A3] pt-5 mt-5 flex justify-between items-center">

          <span className="text-[20px] font-medium text-[#5A1F2F] sm:text-[24px]">
            Grand Total
          </span>

          <span className="text-[26px] font-semibold text-[#5A1F2F] sm:text-[34px]">
            {total}
          </span>

        </div>

      </div>

      <button
        className="
          w-full
          mt-7 sm:mt-10
          h-14
          bg-[#D49E28]
          hover:bg-[#BF8C20]
          text-black
          font-semibold
          text-lg
          transition-all
          duration-300
          rounded-sm
        "
      >
        Proceed to Checkout →
      </button>

      <p className="mt-4 text-center text-sm text-[#7B7367]">
        Taxes and shipping calculated at checkout.
      </p>

    </div>
  );
}
