"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import ProductAccordion from "./ProductAccordion";
import CheckoutModal from "@/components/Cart/CheckoutModal";
import toast from "react-hot-toast";

export default function ProductDetails({ product }) {
  const router = useRouter();

  const variants = useMemo(
    () =>
      Array.isArray(product?.variants)
        ? product.variants.filter(
            (variant) =>
              variant &&
              variant.isActive !== false
          )
        : [],
    [product]
  );

  const [selectedVariantId, setSelectedVariantId] =
    useState(
      variants.length > 0
        ? Number(variants[0].id)
        : null
    );

  const [qty, setQty] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);

  /*
   * Keep the selected variant valid whenever
   * the product/variant list changes.
   */
  useEffect(() => {
    if (!variants.length) {
      if (selectedVariantId !== null) {
        setSelectedVariantId(null);
      }
      return;
    }

    const stillExists = variants.some(
      (variant) =>
        Number(variant.id) ===
        Number(selectedVariantId)
    );

    if (!stillExists) {
      setSelectedVariantId(
        Number(variants[0].id)
      );
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    return (
      variants.find(
        (variant) =>
          Number(variant.id) ===
          Number(selectedVariantId)
      ) || variants[0]
    );
  }, [variants, selectedVariantId]);

  /*
   * Selected variant controls:
   * - price
   * - stock
   * - SKU
   * - main product image
   */
  const displayedPrice = selectedVariant
    ? Number(selectedVariant.price) || 0
    : Number(product.price) || 0;

  const availableStock = selectedVariant
    ? Number(selectedVariant.stock) || 0
    : Number(product.stock) || 0;

  const displayedSku =
    selectedVariant?.sku || "";

  /*
   * Tell ProductGallery which variant is
   * currently selected.
   */
  useEffect(() => {
    if (!selectedVariant) {
      window.dispatchEvent(
        new CustomEvent(
          "tharani-product-variant-change",
          {
            detail: {
              variantId: null,
              imageUrl: "",
            },
          }
        )
      );

      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "tharani-product-variant-change",
        {
          detail: {
            variantId: Number(
              selectedVariant.id
            ),
            imageUrl:
              selectedVariant.imageUrl ||
              selectedVariant.image_url ||
              "",
          },
        }
      )
    );
  }, [selectedVariant]);

  /*
   * IMPORTANT:
   *
   * ProductGallery can also be clicked directly.
   * When a customer clicks a variant thumbnail,
   * ProductGallery sends this event back here.
   *
   * This keeps both sides synchronized:
   *
   * Variant button -> Gallery image
   * Gallery image -> Variant button
   */
  useEffect(() => {
    const handleGalleryVariantSelect = (
      event
    ) => {
      const variantId =
        event.detail?.variantId;

      if (!variantId) return;

      const variant = variants.find(
        (item) =>
          Number(item.id) ===
          Number(variantId)
      );

      if (!variant) return;

      setSelectedVariantId(
        Number(variant.id)
      );

      /*
       * Reset quantity when changing colour.
       */
      setQty(1);
    };

    window.addEventListener(
      "tharani-product-variant-select",
      handleGalleryVariantSelect
    );

    return () => {
      window.removeEventListener(
        "tharani-product-variant-select",
        handleGalleryVariantSelect
      );
    };
  }, [variants]);

  /*
   * Change variant from the buttons on the
   * right side of the product page.
   */
  const handleVariantSelect = (variant) => {
    setSelectedVariantId(
      Number(variant.id)
    );

    setQty(1);
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  /*
   * Quantity controls.
   */
  const decreaseQty = () => {
    setQty((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQty = () => {
    setQty((current) => {
      if (
        availableStock > 0 &&
        current >= availableStock
      ) {
        return current;
      }

      return current + 1;
    });
  };

  /*
   * Add selected product + variant to cart.
   */
  async function addToCart() {
    if (isAddingToCart) {
      return;
    }

    if (
      selectedVariant &&
      availableStock <= 0
    ) {
      toast.error(
        "This variant is currently out of stock."
      );
      return;
    }

    if (
      selectedVariant &&
      availableStock > 0 &&
      qty > availableStock
    ) {
      toast.error(
        `Only ${availableStock} available.`
      );
      return;
    }

    try {
      setIsAddingToCart(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId:
            selectedVariant?.id || null,
          quantity: qty,
        }),
      });

      const data = await res
        .json()
        .catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to add items to your cart.");
          window.dispatchEvent(
            new CustomEvent(
              "tharani-auth-required",
              {
                detail: {
                  message: "Please sign in to add items to your cart.",
                },
              }
            )
          );
          return;
        }

        throw new Error(
          data?.error ||
            "Unable to add product to cart."
        );
      }

      toast.success(
        selectedVariant
          ? `${product.name} — ${selectedVariant.name} added to cart`
          : `${product.name} added to cart`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to add product to cart."
      );
    } finally {
      setIsAddingToCart(false);
    }
  }

  /*
   * Direct BUY NOW checkout:
   * Validates authentication, variant, and stock, then directly opens CheckoutModal
   * without polluting persistent cart or navigating to /cart.
   */
  async function buyNow() {
    if (isAddingToCart || isBuyNowOpen) {
      return;
    }

    if (!selectedVariant && variants.length > 0) {
      toast.error(
        "Please select a color/variant."
      );
      return;
    }

    const currentStock =
      selectedVariant?.stock ??
      product.stock;

    if (
      currentStock !== null &&
      currentStock !== undefined &&
      currentStock < 1
    ) {
      toast.error(
        "This item is currently out of stock."
      );
      return;
    }

    if (
      currentStock !== null &&
      currentStock !== undefined &&
      qty > currentStock
    ) {
      toast.error(
        `Only ${currentStock} available in stock.`
      );
      return;
    }

    try {
      const authRes = await fetch("/api/auth/profile", {
        credentials: "include",
        cache: "no-store",
      });

      if (!authRes.ok) {
        toast.error("Please sign in to continue with checkout.");
        window.dispatchEvent(
          new CustomEvent("tharani-auth-required", {
            detail: {
              message: "Please sign in to continue with checkout.",
            },
          })
        );
        return;
      }
    } catch {
      // Fall through to modal which enforces authentication on order submission
    }

    setIsBuyNowOpen(true);
  }

  const handleBuyNow = buyNow;

  return (
    <div className="flex flex-col pt-1">
      <h1 className="max-w-[520px] font-klaristha text-[26px] uppercase leading-[1.05] tracking-[-0.01em] text-[#C79127] sm:text-[28px] md:text-[36px]">
        {product.name}
      </h1>

      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#D3A358]">
        {product.category}
      </p>

      {variants.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.18em] text-[#2E241B]">
            Select Variant
          </p>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected =
                Number(variant.id) ===
                Number(
                  selectedVariant?.id
                );

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() =>
                    handleVariantSelect(
                      variant
                    )
                  }
                  className={`min-h-[44px] border px-4 py-2 text-sm transition ${
                    isSelected
                      ? "border-[#D4A437] bg-[#D4A437] text-[#123D2A]"
                      : "border-[#D9C9B3] bg-[#FBF5EA] text-[#3C2B1D] hover:border-[#D4A437] hover:bg-[#F7EFD9]"
                  }`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {displayedSku && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#A98A62]">
          SKU: {displayedSku}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-4 border-b border-[#E4D9C6] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[28px] font-medium text-[#2E241B] md:text-[30px]">
            {formatPrice(
              displayedPrice
            )}
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#7B705F]">
            {availableStock > 0
              ? `${availableStock} AVAILABLE`
              : "OUT OF STOCK"}
          </p>
        </div>

        <div className="flex h-[52px] w-fit shrink-0 border border-[#D4A437]">
          <button
            type="button"
            onClick={decreaseQty}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex w-[55px] items-center justify-center bg-[#F4E3B2] text-[#31502F] transition hover:bg-[#EBD49A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus
              size={17}
              strokeWidth={2}
            />
          </button>

          <div className="flex w-[64px] items-center justify-center bg-[#FBF5EA] text-base font-medium text-[#2E241B]">
            {qty}
          </div>

          <button
            type="button"
            onClick={increaseQty}
            disabled={
              availableStock > 0 &&
              qty >= availableStock
            }
            aria-label="Increase quantity"
            className="flex w-[55px] items-center justify-center bg-[#D4A437] text-[#123D2A] transition hover:bg-[#C69728] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="button"
          data-requires-auth="true"
          onClick={addToCart}
          disabled={
            selectedVariant
              ? availableStock <= 0
              : false
          }
          className="h-[52px] w-full border-2 border-[#D4A437] bg-[#D4A437] px-6 text-sm font-semibold tracking-[0.08em] text-[#123D2A] transition hover:bg-[#C69728] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ADD TO BAG
        </button>

        <button
          type="button"
          data-requires-auth="true"
          onClick={buyNow}
          disabled={
            selectedVariant
              ? availableStock <= 0
              : false
          }
          className="h-[52px] w-full border-2 border-[#004831] bg-[#004831] text-sm font-semibold tracking-[0.08em] text-white transition hover:bg-[#003C29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          BUY NOW
        </button>
      </div>

      <div className="mt-5">
        <ProductAccordion />
      </div>

      <CheckoutModal
        open={isBuyNowOpen}
        onClose={() => setIsBuyNowOpen(false)}
        checkoutType="BUY_NOW"
        buyNowItem={{
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity: qty,
        }}
        onOrderCreated={(order) => {
          setIsBuyNowOpen(false);
          router.push(`/orders/${order.orderId || order.id}`);
        }}
      />
    </div>
  );
}