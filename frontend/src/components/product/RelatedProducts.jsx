"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ products }) {
  const scrollerRef = useRef(null);

  const scrollCards = (direction) => {
    if (!scrollerRef.current) {
      return;
    }

    const amount = Math.min(scrollerRef.current.clientWidth * 0.9, 1100);
    scrollerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="pt-10 sm:pt-12">
      <div className="mx-auto max-w-[1420px] px-5 md:px-8 lg:px-10">
        <h2 className="text-center font-klaristha text-[34px] uppercase tracking-[0.02em] text-[#D38E2E] md:text-[46px]">
          You May Also Like
        </h2>

        <div className="relative mt-4 sm:mt-5">
          <button
            onClick={() => scrollCards("left")}
            aria-label="Previous related products"
            className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[calc(50%-10px)] flex-none md:min-w-[calc((100%-40px)/3)] xl:min-w-[calc((100%-60px)/4)]"
              >
                <RelatedCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollCards("right")}
            aria-label="Next related products"
            className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9C7A4] bg-[#FBF5EA]/95 text-[#6E5738] shadow-sm transition hover:bg-white md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadWishlistState = async () => {
      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled) return;

        const wishlistItems = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setWishlisted(
          wishlistItems.some(
            (item) => String(item.product_id ?? item.id) === String(product.id)
          )
        );
      } catch (error) {
        console.error("Failed to load wishlist state:", error);
      }
    };

    loadWishlistState();

    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const toggleWishlist = async () => {
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      const response = await fetch("/api/wishlist", {
        method: wishlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update wishlist");
      }

      setWishlisted((prev) => !prev);
      router.refresh();
    } catch (error) {
      console.error("Wishlist update failed:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block cursor-pointer"
    >
      <div className="relative overflow-hidden border border-[#E6D9C6] bg-[#F7EFE3]">
        <div className="relative aspect-[0.85] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <button
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label="Add to wishlist"
          className={`absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 sm:h-8 sm:w-8 ${
            wishlisted ? "bg-[#5B2333]" : "bg-white"
          }`}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={16}
            height={16}
            className={`object-contain transition-all duration-300 ${
              wishlisted ? "brightness-0 invert" : ""
            }`}
          />
        </button>
      </div>

      <h3 className="mt-3 line-clamp-2 text-[15px] leading-snug text-[#5A4A39] transition-colors group-hover:text-[#C79127]">
        {product.name}
      </h3>

      <p className="mt-1 text-[15px] font-medium text-[#D38E2E]">
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
