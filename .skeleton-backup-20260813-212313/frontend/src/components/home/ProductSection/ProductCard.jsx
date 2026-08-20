"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductCard({
  product,
  initiallyWishlisted = false,
  isHomepageCard = false,
}) {
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);
  const router = useRouter();

  async function toggleWishlist() {
    try {
      const method = wishlisted ? "DELETE" : "POST";

      const res = await fetch("/api/wishlist", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Unable to update wishlist");
      }

      setWishlisted(!wishlisted);

      toast.success(
        wishlisted ? "Removed from wishlist" : "Added to wishlist",
        {
          style: {
            background: "#D4A437",
            color: "#FFFFFF",
            border: "1px solid #C29128",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#D4A437",
          },
        }
      );

      router.refresh();
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast.error(err.message || "Something went wrong.");
    }
  }

  function addToCart() {
    router.push(`/product/${product.slug}`);
  }

  const formattedPrice = new Intl.NumberFormat("en-IN").format(
    Number(String(product.price).replace(/[^0-9.]/g, "")) || 0
  );

  return (
    <div className="group flex h-full flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[3/4] w-full object-contain bg-[#F8F3EA] transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist */}
        <button
          onClick={toggleWishlist}
          className={`
            absolute right-2 top-2 z-20
            flex h-9 w-9 min-h-0 min-w-0 items-center justify-center rounded-full shadow-md
            transition-all duration-300 hover:scale-110 active:scale-95
            sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9
            ${wishlisted ? "bg-[#D4A437]" : "bg-white"}
          `}
          aria-label={`Toggle wishlist for ${product.name}`}
        >
          <img
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            className={`
              h-[18px] w-[18px] object-contain transition-all duration-300
              sm:h-[18px] sm:w-[18px]
              ${wishlisted ? "brightness-0 invert" : ""}
            `}
          />
        </button>

        {/* Add To Cart */}
        {!isHomepageCard && (
          <button
            onClick={addToCart}
            aria-label={`Add ${product.name} to cart`}
            className="
              absolute bottom-2 right-2 z-20
              flex h-9 w-9 items-center justify-center rounded-full
              bg-white shadow-md
              transition-all duration-300
              hover:scale-110 hover:bg-[#D4A437] hover:text-white
              active:scale-95
              sm:bottom-2.5 sm:right-2.5 sm:h-9 sm:w-9
            "
          >
            <ShoppingBag size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="mt-3 sm:mt-4">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="min-w-0 flex-1"
          >
            <h3
              className={`
                line-clamp-2 cursor-pointer
              text-[11px] font-normal leading-5
                sm:text-[15px] sm:leading-6
                ${
                  isHomepageCard
                    ? "text-[#D59B23] hover:text-[#B88718]"
                    : "text-[#444] hover:text-[#D59B23]"
                }
              `}
            >
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <p
            className="
              shrink-0 whitespace-nowrap
              text-[14px] font-medium
              text-[#D59B23]
              sm:text-[20px]
            "
          >
            ₹{formattedPrice}
          </p>
        </div>

        {/* Category */}
        <p
          className={`
            mt-1
            text-[9px] uppercase tracking-[0.12em]
            sm:text-[10px] sm:tracking-[2px]
            ${
              isHomepageCard
                ? "text-[#1E1E1E]"
                : "text-[#B98E2A]"
            }
          `}
        >
          {product.category}
        </p>
      </div>
    </div>
  );
}

