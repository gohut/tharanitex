"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";
import toast from "react-hot-toast";
import CheckoutModal from "@/components/Cart/CheckoutModal";

export default function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const router = useRouter();

  const productVariants = product?.variants;

  const variants = useMemo(
    () => (Array.isArray(productVariants) ? productVariants : []),
    [productVariants]
  );
  const hasVariants = variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? variants[0].id : null
  );

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return (
      variants.find(
        (variant) => Number(variant.id) === Number(selectedVariantId)
      ) || variants[0]
    );
  }, [variants, selectedVariantId, hasVariants]);

  const currentPrice = selectedVariant
    ? Number(selectedVariant.price) || 0
    : Number(product.price) || 0;

  const currentStock = selectedVariant
    ? Number(selectedVariant.stock) || 0
    : Number(product.stock) || 0;

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  function selectVariant(variant) {
    setSelectedVariantId(variant.id);
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
        `Only ${currentStock} item${currentStock === 1 ? "" : "s"} available`
      );
      setQty(currentStock);
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity: qty,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      toast.success(
        selectedVariant
          ? `${product.name} - ${selectedVariant.name} added to cart`
          : `${product.name} added to cart`
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to add product to cart.");
    }
  }

  function increaseQty() {
    if (currentStock <= 0) return;
    setQty((current) => Math.min(current + 1, currentStock));
  }

  function decreaseQty() {
    setQty((current) => Math.max(1, current - 1));
  }

  return (
    <div className="flex flex-col pt-1">
      {/* Product Name */}
      <h1 className="max-w-[520px] font-klaristha text-[26px] uppercase leading-[1.05] tracking-[-0.01em] text-[#C79127] sm:text-[28px] md:text-[36px]">
        {product.name}
      </h1>

      {/* Category */}
      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      {/* Variant Selector */}
      {hasVariants && (
        <div className="mt-6">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#5A4630]">
            Select Variant
          </p>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected =
                Number(variant.id) === Number(selectedVariantId);
              const outOfStock = Number(variant.stock) <= 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => selectVariant(variant)}
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
                        ? "border-[#F2A100] bg-[#F2A100] text-[#2F2417]"
                        : "border-[#D8C7AC] bg-transparent text-[#4B3A29] hover:border-[#F2A100]"
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
            })}
          </div>

          {selectedVariant?.sku && (
            <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9A8467]">
              SKU: {selectedVariant.sku}
            </p>
          )}
        </div>
      )}

      {/* Price + Quantity */}
      <div className="mt-4 flex items-center justify-between border-b border-[#E4D9C6] pb-4">
        <div>
          <p className="text-[22px] font-medium text-[#2E241B] md:text-[26px]">
            {formatPrice(currentPrice)}
          </p>

          {currentStock > 0 && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#8A765B]">
              {currentStock} available
            </p>
          )}

          {currentStock <= 0 && (
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#A33A3A]">
              Out of stock
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="flex h-[22px] shrink-0 border border-[#F2A100]">
          <button
            onClick={decreaseQty}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex w-[22px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={10} strokeWidth={2.5} />
          </button>

          <div className="flex w-[22px] items-center justify-center bg-[#F7E8C5] text-[11px] font-medium leading-none text-[#3F2C12]">
            {qty}
          </div>

          <button
            onClick={increaseQty}
            disabled={currentStock <= 0 || qty >= currentStock}
            aria-label="Increase quantity"
            className="flex w-[22px] items-center justify-center bg-[#F2A100] text-[#3F2C12] transition hover:bg-[#DF9600] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Add To Bag */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={addToCart}
          disabled={currentStock <= 0}
          className="h-11 w-full border-2 border-[#F2A100] bg-[#F2A100] px-6 text-sm font-semibold tracking-[0.06em] text-[#2F2417] transition hover:bg-[#DF9600] disabled:cursor-not-allowed disabled:border-[#D7CDBD] disabled:bg-[#D7CDBD] disabled:text-[#8A7A67] sm:h-[50px]"
        >
          {currentStock <= 0 ? "OUT OF STOCK" : "ADD TO BAG"}
        </button>
      </div>

      {/* Buy Now */}
      <button
        onClick={() => setIsCheckoutOpen(true)}
        disabled={currentStock <= 0}
        className="mt-3 h-11 w-full border-2 border-[#5A1F2F] bg-[#5A1F2F] text-sm font-semibold tracking-[0.06em] text-white transition hover:bg-[#471825] disabled:cursor-not-allowed disabled:border-[#D7CDBD] disabled:bg-[#D7CDBD] sm:h-[50px]"
      >
        BUY NOW
      </button>

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutType="BUY_NOW"
        buyNowItem={{
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity: qty,
        }}
        onOrderCreated={(order) => router.push(`/orders/${order.orderId}`)}
      />

      {/* Details */}
      <div className="mt-5">
        <ProductAccordion />
      </div>
    </div>
  );
}
