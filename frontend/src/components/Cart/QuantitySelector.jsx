"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function QuantitySelector({
  initialQuantity = 1,
  onChange,
}) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const decrease = () => {
    if (quantity <= 1) return;

    const value = quantity - 1;
    setQuantity(value);
    onChange?.(value);
  };

  const increase = () => {
    const value = quantity + 1;
    setQuantity(value);
    onChange?.(value);
  };

  return (
    <div className="flex items-center bg-[#F8E6B9] rounded-sm overflow-hidden">

      <button
        onClick={decrease}
        className="
          w-12 h-12
          flex items-center justify-center
          hover:bg-[#E8C86C]
          transition
        "
      >
        <Minus size={18} />
      </button>

      <span className="w-10 text-center text-lg font-medium">
        {quantity}
      </span>

      <button
        onClick={increase}
        className="
          w-12 h-12
          flex items-center justify-center
          hover:bg-[#E8C86C]
          transition
        "
      >
        <Plus size={18} />
      </button>

    </div>
  );
}