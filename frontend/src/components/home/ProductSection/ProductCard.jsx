"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ProductCard({
  product,
  initiallyWishlisted = false,
}) {
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);
  console.log("PRODUCT CARD:", product);

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
    <div className="group">

        <div className="relative overflow-hidden bg-white">
          <Link href={`/product/${product.slug}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
            />
          </Link>

        {/* Wishlist */}
        <button
            onClick={toggleWishlist}
            className={`
              absolute right-2 top-2 z-20
              h-10 w-10 sm:right-3 sm:top-3
              rounded-full
              flex items-center justify-center
              shadow-md
              transition-all duration-300
              hover:scale-110
              active:scale-95
              ${wishlisted ? "bg-[#D4A437]" : "bg-white"}
            `}
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

        {/* Cart */}
        <button
          onClick={addToCart}
          aria-label={`Add ${product.name} to cart`}
          className="
            absolute bottom-2 right-2 z-20
            h-10 w-10 sm:bottom-3 sm:right-3
            rounded-full
            bg-white
            shadow-md
            flex items-center justify-center
            transition-all duration-300
            hover:bg-[#D4A437]
            hover:text-white
            hover:scale-110
            active:scale-95
          "
        >
          <ShoppingBag size={20} strokeWidth={2} />
        </button>

      </div>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

        {/* Product info */}
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-2 text-[13px] font-normal leading-5 text-[#444] hover:text-[#D59B23] sm:text-[15px] sm:leading-6 cursor-pointer">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#B98E2A] sm:text-[10px] sm:tracking-[2px]">
            {product.category}
          </p>
        </div>

        {/* Price */}
        <p className="text-[16px] font-medium text-[#D59B23] whitespace-nowrap sm:text-[20px]">
          ₹{product.price}
        </p>

      </div>

    </div>
  );
}
