"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import QuantitySelector from "./QuantitySelector";

export default function CartItem({ product }) {

  const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

  const router = useRouter();
  async function removeItem() {
    await fetch(`/api/cart?cartId=${product.id}`, {
      method: "DELETE",
    });

    router.refresh();
  }
  return (
    <div className="relative grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-[#E8DCCB] py-5 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[140px_1fr_160px_120px_60px] lg:items-center lg:gap-8 lg:py-8">

      {/* Product Image */}
      <div>
        <img
          src={product.image}
          alt={product.name}
          className="h-[128px] w-[96px] rounded-sm object-cover sm:h-[150px] sm:w-[120px] lg:h-[160px]"
        />
      </div>

      {/* Product Details */}
      <div>
        <h3 className="line-clamp-2 text-[17px] font-medium leading-tight text-[#3E3A39] sm:text-[20px] lg:text-[22px]">
          {product.name}
        </h3>

        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#C69A39] lg:tracking-[0.18em] lg:text-[11px]">
          {product.category}
        </p>

        <p className="mt-3 text-[20px] font-medium text-[#D49E28] sm:text-[24px] lg:mt-5 lg:text-[28px]">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Quantity */}
      <div className="col-span-2 flex items-center justify-between border-t border-[#F0E5D6] pt-4 lg:col-span-1 lg:block lg:border-0 lg:pt-0">
        <span className="text-xs uppercase tracking-[0.12em] text-[#8A8175] lg:hidden">Quantity</span>
        <QuantitySelector
          cartId={product.id}
          quantity={product.quantity}
        />
      </div>

      {/* Total */}
      <div className="col-span-2 flex items-center justify-between lg:col-span-1 lg:block lg:text-center">
        <span className="text-xs uppercase tracking-[0.12em] text-[#8A8175] lg:hidden">Total</span>
        <p className="text-[18px] font-medium text-[#3E3A39] sm:text-[20px] lg:text-[22px]">
          {formatPrice(product.price * product.quantity)}
        </p>
      </div>

      {/* Remove */}
      <div className="absolute right-0 top-4 flex justify-center lg:static">
        <button
          onClick={removeItem}
          className="
            h-10 w-10
            rounded-full
            flex items-center justify-center
            text-gray-500
            hover:bg-[#5A1F2F]
            hover:text-white
            transition-all
            duration-300
          "
        >
          <X size={20} />
        </button>
      </div>

    </div>
  );
}
