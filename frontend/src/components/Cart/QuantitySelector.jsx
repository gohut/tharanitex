"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function QuantitySelector({
  cartId,
  quantity: initialQuantity = 1,
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  async function updateQuantity(value) {
    if (updating) return;

    setUpdating(true);

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cartId,
          quantity: value,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update quantity."
        );
      }

      setQuantity(value);
      router.refresh();
    } catch (error) {
      console.error("Cart quantity update failed:", error);

      toast.error(
        error.message || "Unable to update quantity."
      );
    } finally {
      setUpdating(false);
    }
  }

  const decrease = () => {
    if (quantity <= 1 || updating) return;

    updateQuantity(quantity - 1);
  };

  const increase = () => {
    if (updating) return;

    updateQuantity(quantity + 1);
  };

  return (
    <div className="flex items-center overflow-hidden rounded-sm bg-[#F8E6B9]">
      <button
        type="button"
        onClick={decrease}
        disabled={updating || quantity <= 1}
        className="
          flex h-8 w-8 items-center justify-center
          transition
          hover:bg-[#E8C86C]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <Minus size={13} />
      </button>

      <span className="w-7 text-center text-sm font-medium">
        {quantity}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={updating}
        className="
          flex h-8 w-8 items-center justify-center
          transition
          hover:bg-[#E8C86C]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <Plus size={13} />
      </button>
    </div>
  );
}