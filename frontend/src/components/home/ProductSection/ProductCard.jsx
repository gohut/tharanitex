"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ProductCard({
  product,
  initiallyWishlisted = false,
  isHomepageCard = false,
}) {
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);

  async function toggleWishlist() {
    try {
      if (!wishlisted) {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "guest",
            productId: product.id,
          }),
        });

        if (!res.ok) throw new Error();

        setWishlisted(true);
        toast.success("Added to wishlist", {
          style: {
            background: "#D4A437",
            color: "#FFFFFF",
            border: "1px solid #C29128",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#D4A437",
          },
        });
      } else {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "guest",
            productId: product.id,
          }),
        });

        if (!res.ok) throw new Error();

        setWishlisted(false);
        toast.success("Removed from wishlist", {
          style: {
            background: "#D4A437",
            color: "#FFFFFF",
            border: "1px solid #C29128",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#D4A437",
          },
        });
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  }

  async function addToCart() {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "guest",
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to add product to cart");
    }
  }

  return (
    <div className="group flex h-full flex-col">
      <div className="relative overflow-hidden bg-white">
        <Link href={`/product/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
          />
        </Link>

        <button
          onClick={toggleWishlist}
          className={`
            absolute right-2 top-2 z-20
            flex h-10 w-10 items-center justify-center rounded-full shadow-md
            transition-all duration-300 hover:scale-110 active:scale-95
            sm:right-3 sm:top-3
            ${wishlisted ? "bg-[#D4A437]" : "bg-white"}
          `}
          aria-label={`Toggle wishlist for ${product.name}`}
        >
          <img
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            className={`
              h-7 w-7 object-contain transition-all duration-300 sm:h-8 sm:w-8
              ${wishlisted ? "brightness-0 invert" : ""}
            `}
          />
        </button>

        {!isHomepageCard && (
          <button
            onClick={addToCart}
            aria-label={`Add ${product.name} to cart`}
            className="
              absolute bottom-2 right-2 z-20
              flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md
              transition-all duration-300 hover:scale-110 hover:bg-[#D4A437] hover:text-white active:scale-95
              sm:bottom-3 sm:right-3
            "
          >
            <ShoppingBag size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-2 sm:mt-4">
        <div className="min-h-[4.75rem]">
          <Link href={`/product/${product.slug}`}>
            <h3 className={`line-clamp-2 cursor-pointer text-[13px] font-normal leading-5 sm:text-[15px] sm:leading-6 ${
              isHomepageCard ? "text-[#D59B23] hover:text-[#B88718]" : "text-[#444] hover:text-[#D59B23]"
            }`}>
              {product.name}
            </h3>
          </Link>

          <p className={`mt-1 text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[2px] ${
            isHomepageCard ? "text-[#1E1E1E]" : "text-[#B98E2A]"
          }`}>
            {product.category}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="whitespace-nowrap text-[16px] font-medium text-[#D59B23] sm:text-[20px]">
            Rs. {product.price}
          </p>
        </div>
      </div>
    </div>
  );
}
