"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ products = [] }) {
  const scrollerRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /*
   * ============================================================
   * SCROLL STATE
   * ============================================================
   */

  const updateScrollButtons = () => {
    const element = scrollerRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft =
      element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 2);
  };

  useEffect(() => {
    const element = scrollerRef.current;

    if (!element) {
      return;
    }

    updateScrollButtons();

    element.addEventListener(
      "scroll",
      updateScrollButtons,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateScrollButtons
    );

    return () => {
      element.removeEventListener(
        "scroll",
        updateScrollButtons
      );

      window.removeEventListener(
        "resize",
        updateScrollButtons
      );
    };
  }, [products]);

  /*
   * ============================================================
   * SCROLL CARDS
   * ============================================================
   */

  const scrollCards = (direction) => {
    const element = scrollerRef.current;

    if (!element) {
      return;
    }

    /*
     * Scroll approximately one viewport at a time.
     * This works correctly across desktop and mobile widths.
     */
    const amount = Math.min(
      element.clientWidth * 0.9,
      1100
    );

    element.scrollBy({
      left:
        direction === "left"
          ? -amount
          : amount,
      behavior: "smooth",
    });
  };

  /*
   * Don't render an empty recommendation section.
   */
  if (!products.length) {
    return null;
  }

  return (
    <section className="pt-10 sm:pt-12">
      <div className="mx-auto max-w-[1420px] px-5 md:px-8 lg:px-10">

        {/* ======================================================
            TITLE
        ====================================================== */}

        <h2 className="text-center font-klaristha text-[34px] uppercase tracking-[0.02em] text-[#D38E2E] md:text-[46px]">
          You May Also Like
        </h2>

        {/* ======================================================
            CAROUSEL
        ====================================================== */}

        <div className="relative mt-4 sm:mt-5">

          {/* LEFT ARROW */}

          <button
            type="button"
            onClick={() => scrollCards("left")}
            disabled={!canScrollLeft}
            aria-label="Previous related products"
            className={`
              absolute left-0 top-1/2 z-20
              hidden h-11 w-11
              -translate-x-1/2
              -translate-y-1/2
              items-center justify-center
              rounded-full
              border border-[#D9C7A4]
              bg-[#FBF5EA]/95
              text-[#6E5738]
              shadow-sm
              transition
              md:flex
              ${
                canScrollLeft
                  ? "cursor-pointer hover:bg-white"
                  : "cursor-default opacity-30"
              }
            `}
          >
            <ChevronLeft size={20} />
          </button>

          {/* ====================================================
              PRODUCT SCROLLER
          ==================================================== */}

          <div
            ref={scrollerRef}
            className="
              flex
              gap-5
              overflow-x-auto
              scroll-smooth
              pb-2
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  min-w-[calc(50%-10px)]
                  flex-none
                  md:min-w-[calc((100%-40px)/3)]
                  xl:min-w-[calc((100%-60px)/4)]
                "
              >
                <RelatedCard product={product} />
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}

          <button
            type="button"
            onClick={() => scrollCards("right")}
            disabled={!canScrollRight}
            aria-label="Next related products"
            className={`
              absolute right-0 top-1/2 z-20
              hidden h-11 w-11
              translate-x-1/2
              -translate-y-1/2
              items-center justify-center
              rounded-full
              border border-[#D9C7A4]
              bg-[#FBF5EA]/95
              text-[#6E5738]
              shadow-sm
              transition
              md:flex
              ${
                canScrollRight
                  ? "cursor-pointer hover:bg-white"
                  : "cursor-default opacity-30"
              }
            `}
          >
            <ChevronRight size={20} />
          </button>

        </div>
      </div>
    </section>
  );
}


/* ================================================================
   RELATED PRODUCT CARD
   ================================================================ */

function RelatedCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /*
   * ============================================================
   * LOAD WISHLIST STATE
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistState() {
      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        const wishlistItems = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const exists = wishlistItems.some(
          (item) =>
            String(
              item.product_id ?? item.id
            ) === String(product.id)
        );

        setWishlisted(exists);
      } catch (error) {
        console.error(
          "Failed to load wishlist state:",
          error
        );
      }
    }

    loadWishlistState();

    return () => {
      cancelled = true;
    };
  }, [product.id]);

  /*
   * ============================================================
   * WISHLIST
   * ============================================================
   */

  const toggleWishlist = async (event) => {
    /*
     * Important:
     * This button is intentionally outside the product Link,
     * but stop propagation anyway so it can never accidentally
     * trigger product navigation.
     */
    event.preventDefault();
    event.stopPropagation();

    if (wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await fetch(
        "/api/wishlist",
        {
          method: wishlisted
            ? "DELETE"
            : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to update wishlist"
        );
      }

      setWishlisted((previous) => !previous);
    } catch (error) {
      console.error(
        "Wishlist update failed:",
        error
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  /*
   * ============================================================
   * PRICE
   * ============================================================
   */

  const formatPrice = (value) => {
    const numericValue = Number(value);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(
      Number.isFinite(numericValue)
        ? numericValue
        : 0
    );
  };

  return (
    <div className="group relative">

      {/* ========================================================
          PRODUCT IMAGE
      ======================================================== */}

      <div className="relative overflow-hidden border border-[#E6D9C6] bg-[#F7EFE3]">

        {/* Product navigation */}
        <Link
          href={`/product/${product.slug}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[0.85] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="
                (max-width: 767px) 50vw,
                (max-width: 1279px) 33vw,
                25vw
              "
              className="
                object-cover
                transition
                duration-500
                group-hover:scale-105
              "
            />
          </div>
        </Link>

        {/* ======================================================
            WISHLIST BUTTON

            IMPORTANT:
            This is NOT inside the Link.
            Therefore clicking the heart will NEVER navigate
            to the product page.
        ====================================================== */}

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`
            absolute
            right-2
            top-2
            z-20
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            shadow-md
            transition-all
            duration-300
            sm:right-2.5
            sm:top-2.5
            sm:h-8
            sm:w-8
            ${
              wishlisted
                ? "bg-[#00361f]"
                : "bg-white"
            }
            ${
              wishlistLoading
                ? "cursor-wait opacity-60"
                : "hover:scale-110 active:scale-95"
            }
          `}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt=""
            width={16}
            height={16}
            className={`
              object-contain
              transition-all
              duration-300
              ${
                wishlisted
                  ? "brightness-0 invert"
                  : ""
              }
            `}
          />
        </button>
      </div>

      {/* ========================================================
          PRODUCT INFORMATION
      ======================================================== */}

      <div className="mt-3">

        {/* Product name is also clickable */}
        <Link
          href={`/product/${product.slug}`}
          className="
            block
            line-clamp-2
            text-[15px]
            leading-snug
            text-[#5A4A39]
            transition-colors
            hover:text-[#C79127]
          "
        >
          {product.name}
        </Link>

        {/* Price */}
        <p className="mt-1 text-[15px] font-medium text-[#D38E2E]">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}