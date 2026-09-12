"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  ...props
}) {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async (e) => {
    if (disabled || loading || internalLoading) return;
    if (onClick) {
      const result = onClick(e);
      if (result && typeof result.then === "function") {
        setInternalLoading(true);
        try {
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  const isBusy = disabled || loading || internalLoading;

  const variants = {
    primary: "bg-[#D4AF37] hover:bg-[#C49B24] text-[#2F2B27] font-bold shadow-sm active:scale-[0.99] transition-all",
    burgundy: "bg-[#5A1F2F] hover:bg-[#471825] text-white font-bold shadow-sm active:scale-[0.99] transition-all",
    secondary: "bg-white hover:bg-[#FAF6F0] text-[#2F2B27] border border-[#E8DCC8] font-semibold shadow-xs transition-all",
    danger: "bg-[#C5221F] hover:bg-[#A51B18] text-white font-semibold shadow-sm transition-all",
    ghost: "bg-transparent hover:bg-[#FAF6F0] text-[#7C7267] hover:text-[#2F2B27] transition-all",
    outline: "bg-transparent border border-[#D4AF37] text-[#8C6D1F] hover:bg-[#D4AF37]/10 font-bold transition-all",
    gold: "bg-[#D4AF37] hover:bg-[#C49B24] text-[#2F2B27] font-bold shadow-sm transition-all",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  const spinnerSizes = {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 18,
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isBusy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-sans transition-all duration-150 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        isBusy ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      {(loading || internalLoading) && (
        <Loader2 size={spinnerSizes[size] || 15} className="animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
