"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuantitySelector({
  cartId,
  quantity: initialQuantity = 1,
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const router = useRouter();

  async function updateQuantity(value) {
    setQuantity(value);

    await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartId,
        quantity: value,
      }),
    });

    router.refresh();
  }

  const decrease = () => {
    if (quantity <= 1) return;

    updateQuantity(quantity - 1);
  };

  const increase = () => {
    updateQuantity(quantity + 1);
  };

  return (
    <div className="flex items-center bg-[#F8E6B9] rounded-sm overflow-hidden">
      <button
        onClick={decrease}
        className="
          w-8 h-8
          flex items-center justify-center
          hover:bg-[#E8C86C]
          transition
        "
      >
        <Minus size={13} />
      </button>

      <span className="w-7 text-center text-sm font-medium">
        {quantity}
      </span>

      <button
        onClick={increase}
        className="
          w-8 h-8
          flex items-center justify-center
          hover:bg-[#E8C86C]
          transition
        "
      >
        <Plus size={13} />
      </button>
    </div>
  );
}