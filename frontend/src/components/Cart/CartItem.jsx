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
    <div className="grid grid-cols-[140px_1fr_160px_120px_60px] items-center gap-8 py-8 border-b border-[#E8DCCB]">

      {/* Product Image */}
      <div>
        <img
          src={product.image}
          alt={product.name}
          className="w-[120px] h-[160px] object-cover rounded-sm"
        />
      </div>

      {/* Product Details */}
      <div>
        <h3 className="text-[22px] text-[#3E3A39] font-medium">
          {product.name}
        </h3>

        <p className="mt-2 uppercase tracking-[0.18em] text-[11px] text-[#C69A39]">
          {product.category}
        </p>

        <p className="mt-5 text-[28px] font-medium text-[#D49E28]">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Quantity */}
      <div className="flex justify-center">
        <QuantitySelector
          cartId={product.id}
          quantity={product.quantity}
        />
      </div>

      {/* Total */}
      <div className="text-center">
        <p className="text-[22px] text-[#3E3A39] font-medium">
          {formatPrice(product.price * product.quantity)}
        </p>
      </div>

      {/* Remove */}
      <div className="flex justify-center">
        <button
          onClick={removeItem}
          className="
            w-10 h-10
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