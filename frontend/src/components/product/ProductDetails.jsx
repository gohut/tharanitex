"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Minus,
  Plus,
} from "lucide-react";

import ProductAccordion from "./ProductAccordion";

import toast from "react-hot-toast";

import CheckoutModal from "@/components/Cart/CheckoutModal";

export default function ProductDetails({
  product,
}) {
  const router = useRouter();

  const [
    isCheckoutOpen,
    setIsCheckoutOpen,
  ] = useState(false);

  const variants =
    Array.isArray(
      product.variants
    )
      ? product.variants
      : [];

  const hasVariants =
    variants.length > 0;

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(
    hasVariants
      ? variants[0].id
      : null
  );

  const [qty, setQty] =
    useState(1);

  const selectedVariant =
    useMemo(() => {
      if (!hasVariants) {
        return null;
      }

      return (
        variants.find(
          (variant) =>
            Number(variant.id) ===
            Number(
              selectedVariantId
            )
        ) ||
        variants[0]
      );
    }, [
      variants,
      selectedVariantId,
      hasVariants,
    ]);

  useEffect(() => {
    if (
      hasVariants &&
      !selectedVariant
    ) {
      setSelectedVariantId(
        variants[0].id
      );
    }
  }, [
    hasVariants,
    selectedVariant,
    variants,
  ]);

  const currentPrice =
    selectedVariant
      ? Number(
          selectedVariant.price
        ) || 0
      : Number(
          product.price
        ) || 0;

  const currentStock =
    selectedVariant
      ? Number(
          selectedVariant.stock
        ) || 0
      : Number(
          product.stock
        ) || 0;

  const formatPrice = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);

  function selectVariant(
    variant
  ) {
    setSelectedVariantId(
      variant.id
    );

    setQty(1);
  }

  async function addToCart() {
    if (currentStock <= 0) {
      toast.error(
        selectedVariant
          ? `${selectedVariant.name} is out of stock`
          : "This product is out of stock"
      );

      return;
    }

    if (qty > currentStock) {
      toast.error(
        `Only ${currentStock} item${
          currentStock === 1
            ? ""
            : "s"
        } available`
      );

      setQty(currentStock);

      return;
    }

    try {
      const res =
        await fetch(
          "/api/cart",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify({
              productId:
                product.id,
              variantId:
                selectedVariant?.id ||
                null,
              quantity: qty,
            }),
          }
        );

      const data =
        await res
          .json()
          .catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Request failed"
        );
      }

      toast.success(
        selectedVariant
          ? `${product.name} - ${selectedVariant.name} added to cart`
          : `${product.name} added to cart`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Unable to add product to cart."
      );
    }
  }

  function handleBuyNow() {
    if (currentStock <= 0) {
      toast.error(
        selectedVariant
          ? `${selectedVariant.name} is out of stock`
          : "This product is out of stock"
      );

      return;
    }

    if (qty > currentStock) {
      toast.error(
        `Only ${currentStock} item${
          currentStock === 1
            ? ""
            : "s"
        } available`
      );

      setQty(currentStock);

      return;
    }

    setIsCheckoutOpen(true);
  }

  function increaseQty() {
    if (currentStock <= 0) {
      return;
    }

    setQty(
      (current) =>
        Math.min(
          current + 1,
          currentStock
        )
    );
  }

  function decreaseQty() {
    setQty(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }

  return (
    <div className="flex flex-col pt-1">

      {/* PRODUCT NAME */}
      <h1
        className="
          max-w-[520px]
          font-klaristha
          text-[26px]
          uppercase
          leading-[1.05]
          tracking-[-0.01em]
          text-[#C79127]
          sm:text-[28px]
          md:text-[36px]
        "
      >
        {product.name}
      </h1>

      {/* CATEGORY */}
      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      {/* VARIANTS */}
      {hasVariants && (
        <div className="mt-6">

          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#5A4630]">
            Select Variant
          </p>

          <div className="flex flex-wrap gap-2">
            {variants.map(
              (variant) => {
                const isSelected =
                  Number(
                    variant.id
                  ) ===
                  Number(
                    selectedVariantId
                  );

                const outOfStock =
                  Number(
                    variant.stock
                  ) <= 0;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={
                      outOfStock
                    }
                    onClick={() =>
                      selectVariant(
                        variant
                      )
                    }
                    className={`
                      min-w-[90px]
                      border
                      px-4
                      py-2.5
                      text-xs
                      font-medium
                      transition-all
                      ${
                        isSelected
                          ? "border-[#D4A437] bg-[#D4A437] text-[#173B28]"
                          : "border-[#D8C7AC] bg-transparent text-[#4B3A29] hover:border-[#D4A437]"
                      }
                      ${
                        outOfStock
                          ? "cursor-not-allowed opacity-40 line-through"
                          : ""
                      }
                    `}
                  >
                    {variant.name}
                  </button>
                );
              }
            )}
          </div>

          {selectedVariant?.sku && (
            <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9A8467]">
              SKU:{" "}
              {selectedVariant.sku}
            </p>
          )}
        </div>
      )}

      {/* PRICE + QUANTITY */}
      <div className="mt-5 flex items-center justify-between border-b border-[#E4D9C6] pb-5">

        <div>
          <p className="text-[22px] font-medium text-[#2E241B] md:text-[26px]">
            {formatPrice(
              currentPrice
            )}
          </p>

          {currentStock > 0 && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#8A765B]">
              {currentStock}{" "}
              available
            </p>
          )}

          {currentStock <= 0 && (
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#A33A3A]">
              Out of stock
            </p>
          )}
        </div>

        {/* PROPERLY SIZED QUANTITY SELECTOR */}
        <div className="flex h-11 shrink-0 overflow-hidden rounded-sm border border-[#D4A437]">

          <button
            type="button"
            onClick={decreaseQty}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="
              flex
              h-full
              w-11
              items-center
              justify-center
              bg-[#D4A437]
              text-[#173B28]
              transition
              hover:bg-[#C29128]
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:w-12
            "
          >
            <Minus
              size={15}
              strokeWidth={2.5}
            />
          </button>

          <div
            className="
              flex
              h-full
              min-w-12
              items-center
              justify-center
              bg-[#FBF5EA]
              px-3
              text-sm
              font-semibold
              text-[#173B28]
              sm:min-w-14
            "
          >
            {qty}
          </div>

          <button
            type="button"
            onClick={increaseQty}
            disabled={
              currentStock <= 0 ||
              qty >= currentStock
            }
            aria-label="Increase quantity"
            className="
              flex
              h-full
              w-11
              items-center
              justify-center
              bg-[#D4A437]
              text-[#173B28]
              transition
              hover:bg-[#C29128]
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:w-12
            "
          >
            <Plus
              size={15}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>

      {/* ADD TO BAG */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          data-requires-auth="true"
          onClick={addToCart}
          disabled={
            currentStock <= 0
          }
          className="
            h-12
            w-full
            border-2
            border-[#D4A437]
            bg-[#D4A437]
            px-6
            text-sm
            font-semibold
            tracking-[0.06em]
            text-[#173B28]
            transition
            hover:bg-[#C29128]
            disabled:cursor-not-allowed
            disabled:border-[#D7CDBD]
            disabled:bg-[#D7CDBD]
            disabled:text-[#8A7A67]
            sm:h-[52px]
          "
        >
          {currentStock <= 0
            ? "OUT OF STOCK"
            : "ADD TO BAG"}
        </button>
      </div>

      {/* BUY NOW */}
      <button
        data-requires-auth="true"
        onClick={handleBuyNow}
        disabled={
          currentStock <= 0
        }
        className="
          mt-3
          h-12
          w-full
          border-2
          border-[#00361F]
          bg-[#00361F]
          text-sm
          font-semibold
          tracking-[0.06em]
          text-white
          transition
          hover:bg-[#002B19]
          disabled:cursor-not-allowed
          disabled:border-[#D7CDBD]
          disabled:bg-[#D7CDBD]
          sm:h-[52px]
        "
      >
        BUY NOW
      </button>

      {/* CHECKOUT */}
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() =>
          setIsCheckoutOpen(false)
        }
        checkoutType="BUY_NOW"
        buyNowItem={{
          productId:
            product.id,
          variantId:
            selectedVariant?.id ||
            null,
          quantity: qty,
        }}
        onOrderCreated={(
          order
        ) =>
          router.push(
            `/orders/${order.orderId}`
          )
        }
      />

      {/* DETAILS */}
      <div className="mt-5">
        <ProductAccordion />
      </div>
    </div>
  );
}