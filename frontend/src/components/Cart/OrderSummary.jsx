"use client";

export default function OrderSummary({
  subtotal = "₹5,730",
  shipping = "Free",
  tax = "Calculated at checkout",
  total = "₹5,730",
}) {
  return (
    <div className="bg-[#FFF7E9] border border-[#E8DCCB] p-8 rounded-sm shadow-sm">

      <h2 className="text-[30px] font-serif text-[#5A1F2F]">
        Order Summary
      </h2>

      <div className="mt-8 space-y-5">

        <div className="flex justify-between text-[18px]">
          <span className="text-[#5F5F5F]">Subtotal</span>
          <span>{subtotal}</span>
        </div>

        <div className="flex justify-between text-[18px]">
          <span className="text-[#5F5F5F]">Shipping</span>
          <span>{shipping}</span>
        </div>

        <div className="flex justify-between text-[18px]">
          <span className="text-[#5F5F5F]">Taxes</span>
          <span className="text-sm text-gray-500">{tax}</span>
        </div>

        <div className="border-t border-[#DCC9A3] pt-5 mt-5 flex justify-between items-center">

          <span className="text-[24px] font-medium text-[#5A1F2F]">
            Grand Total
          </span>

          <span className="text-[34px] font-semibold text-[#5A1F2F]">
            {total}
          </span>

        </div>

      </div>

      <button
        className="
          w-full
          mt-10
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