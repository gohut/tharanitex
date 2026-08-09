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
    <div className="relative grid grid-cols-[80px_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-[#E8DCCB] py-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-x-4 sm:py-5 lg:grid-cols-[140px_1fr_160px_120px_60px] lg:items-center lg:gap-8 lg:py-8">

      {/* Product Image */}
      <div>
        <img
          src={product.image}
          alt={product.name}
          className="h-[96px] w-[80px] rounded-sm object-cover sm:h-[128px] sm:w-[104px] lg:h-[160px] lg:w-[140px]"
        />
      </div>

      {/* Product Details */}
      <div>
        <h3 className="line-clamp-2 text-[14px] font-medium leading-tight text-[#3E3A39] sm:text-[18px] lg:text-[22px]">
          {product.name}
        </h3>

        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#C69A39] sm:mt-1.5 sm:text-[10px] lg:tracking-[0.18em] lg:text-[11px]">
          {product.category}
        </p>

        {/* Quantity + Price grouped together (mobile / tablet) */}
        <div className="mt-2.5 flex items-center justify-between gap-3 sm:mt-3 lg:hidden">
          <QuantitySelector
            cartId={product.id}
            quantity={product.quantity}
          />
          <p className="text-[16px] font-medium text-[#D49E28] sm:text-[19px]">
            {formatPrice(product.price * product.quantity)}
          </p>
        </div>

        {/* Price only (desktop keeps its own column) */}
        <p className="mt-4 hidden text-[26px] font-medium text-[#D49E28] lg:block">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Quantity (desktop column) */}
      <div className="hidden lg:block">
        <QuantitySelector
          cartId={product.id}
          quantity={product.quantity}
        />
      </div>

      {/* Total (desktop column) */}
      <div className="hidden lg:block lg:text-center">
        <p className="text-[22px] font-medium text-[#3E3A39]">
          {formatPrice(product.price * product.quantity)}
        </p>
      </div>

      {/* Remove */}
      <div className="absolute right-0 top-3 flex justify-center lg:static">
        <button
          onClick={removeItem}
          className="
            h-8 w-8
            rounded-full
            flex items-center justify-center
            text-gray-500
            hover:bg-[#5A1F2F]
            hover:text-white
            transition-all
            duration-300
            lg:h-10 lg:w-10
          "
        >
          <X size={16} />
        </button>
      </div>

    </div>
  );
}
