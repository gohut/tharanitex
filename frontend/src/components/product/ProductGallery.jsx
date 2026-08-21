"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";

export default function ProductGallery({
  images = [],
  variants = [],
}) {
  const [selected, setSelected] = useState(0);
  const [selectedVariantId, setSelectedVariantId] =
    useState(
      variants?.length
        ? Number(variants[0].id)
        : null
    );

  const [wishlisted, setWishlisted] =
    useState(false);

  const scrollerRef = useRef(null);

  /*
   * Only active variants with an actual image
   * are shown in the variant-image gallery.
   */
  const variantImages = useMemo(() => {
    if (!Array.isArray(variants)) {
      return [];
    }

    return variants
      .filter(
        (variant) =>
          variant &&
          variant.isActive !== false &&
          (variant.imageUrl ||
            variant.image_url)
      )
      .map((variant) => ({
        id: Number(variant.id),
        name: variant.name || "Variant",
        image:
          variant.imageUrl ||
          variant.image_url,
      }));
  }, [variants]);

  /*
   * Normal product images.
   *
   * These remain available after the variant
   * images so customers can still browse
   * additional product photography.
   */
  const productImages = useMemo(() => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter(Boolean);
  }, [images]);

  /*
   * Build the complete gallery.
   *
   * Variant images come FIRST.
   * Product images follow them.
   *
   * Duplicate URLs are removed.
   */
  const galleryItems = useMemo(() => {
    const items = [];
    const usedImages = new Set();

    variantImages.forEach((variant) => {
      if (!usedImages.has(variant.image)) {
        usedImages.add(variant.image);

        items.push({
          type: "variant",
          variantId: variant.id,
          variantName: variant.name,
          image: variant.image,
        });
      }
    });

    productImages.forEach((image) => {
      if (!usedImages.has(image)) {
        usedImages.add(image);

        items.push({
          type: "product",
          image,
        });
      }
    });

    return items;
  }, [variantImages, productImages]);

  /*
   * Find the gallery index for the selected
   * variant.
   */
  const selectedVariantIndex = useMemo(() => {
    if (!selectedVariantId) {
      return -1;
    }

    return galleryItems.findIndex(
      (item) =>
        item.type === "variant" &&
        Number(item.variantId) ===
          Number(selectedVariantId)
    );
  }, [galleryItems, selectedVariantId]);

  /*
   * ProductDetails -> ProductGallery
   *
   * When the customer clicks a variant button
   * in ProductDetails, the gallery jumps to
   * that variant's image.
   */
  useEffect(() => {
    const handleVariantChange = (event) => {
      const variantId =
        event.detail?.variantId ?? null;

      setSelectedVariantId(
        variantId ? Number(variantId) : null
      );

      if (!variantId) {
        setSelected(0);
        return;
      }

      const index = galleryItems.findIndex(
        (item) =>
          item.type === "variant" &&
          Number(item.variantId) ===
            Number(variantId)
      );

      if (index === -1) {
        return;
      }

      setSelected(index);

      requestAnimationFrame(() => {
        scrollToIndex(index);
      });
    };

    window.addEventListener(
      "tharani-product-variant-change",
      handleVariantChange
    );

    return () => {
      window.removeEventListener(
        "tharani-product-variant-change",
        handleVariantChange
      );
    };
  }, [galleryItems]);

  /*
   * If variants are available, select the first
   * variant automatically.
   */
  useEffect(() => {
    if (!variantImages.length) {
      return;
    }

    const firstVariant =
      variantImages[0];

    if (!selectedVariantId) {
      setSelectedVariantId(
        Number(firstVariant.id)
      );

      const index =
        galleryItems.findIndex(
          (item) =>
            item.type === "variant" &&
            Number(item.variantId) ===
              Number(firstVariant.id)
        );

      if (index !== -1) {
        setSelected(index);
      }
    }
  }, [
    variantImages,
    galleryItems,
    selectedVariantId,
  ]);

  /*
   * Keep thumbnail position synchronized
   * when the customer swipes the main gallery.
   */
  useEffect(() => {
    const scroller =
      scrollerRef.current;

    if (!scroller) return;

    const handleScroll = () => {
      const width =
        scroller.clientWidth || 1;

      const index = Math.round(
        scroller.scrollLeft / width
      );

      setSelected(
        Math.max(
          0,
          Math.min(
            index,
            galleryItems.length - 1
          )
        )
      );
    };

    scroller.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      scroller.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [galleryItems.length]);

  /*
   * Scroll main gallery to a particular item.
   */
  function scrollToIndex(index) {
    const scroller =
      scrollerRef.current;

    if (!scroller) return;

    const child =
      scroller.children[index];

    if (!child) return;

    child.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  /*
   * Customer clicked a thumbnail.
   *
   * If it is a variant image, notify
   * ProductDetails so price/stock/SKU also
   * change.
   */
  function handleThumbnailClick(
    item,
    index
  ) {
    setSelected(index);

    scrollToIndex(index);

    if (
      item.type === "variant" &&
      item.variantId
    ) {
      setSelectedVariantId(
        Number(item.variantId)
      );

      window.dispatchEvent(
        new CustomEvent(
          "tharani-product-variant-select",
          {
            detail: {
              variantId: Number(
                item.variantId
              ),
            },
          }
        )
      );
    }
  }

  /*
   * No images.
   */
  if (!galleryItems.length) {
    return (
      <div className="flex aspect-[0.82] w-full items-center justify-center border border-[#E8DDCE] bg-[#F4EBDD] text-sm text-[#8A7C6A] sm:aspect-[0.78]">
        Product image unavailable
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* MAIN IMAGE GALLERY */}
      <div className="relative aspect-[0.82] w-full overflow-hidden border border-[#E8DDCE] bg-[#F4EBDD] sm:aspect-[0.78]">
        <div
          ref={scrollerRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryItems.map(
            (item, index) => (
              <div
                key={`${item.image}-${index}`}
                className="relative h-full w-full shrink-0 snap-start"
              >
                <Image
                  src={item.image}
                  alt={
                    item.type ===
                    "variant"
                      ? item.variantName
                      : `Product image ${
                          index + 1
                        }`
                  }
                  fill
                  priority={
                    index === 0
                  }
                  unoptimized
                  draggable={false}
                  className="select-none object-cover"
                />

                {/* Show variant name on main image */}
                {item.type ===
                  "variant" && (
                  <div className="absolute bottom-3 left-3 z-10 bg-[#004831]/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {item.variantName}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={() =>
            setWishlisted(
              (current) => !current
            )
          }
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            wishlisted
              ? "bg-[#004831]"
              : "bg-white"
          }`}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={18}
            height={18}
            className={`object-contain transition-all duration-300 ${
              wishlisted
                ? "brightness-0 invert"
                : ""
            }`}
          />
        </button>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {galleryItems.map(
          (item, index) => {
            const isSelected =
              selected === index;

            const isSelectedVariant =
              item.type ===
                "variant" &&
              Number(
                item.variantId
              ) ===
                Number(
                  selectedVariantId
                );

            return (
              <button
                type="button"
                key={`${item.image}-thumb-${index}`}
                onClick={() =>
                  handleThumbnailClick(
                    item,
                    index
                  )
                }
                aria-label={
                  item.type ===
                  "variant"
                    ? `Select ${item.variantName} variant`
                    : `View product image ${
                        index + 1
                      }`
                }
                className={`relative h-[74px] w-[62px] shrink-0 overflow-hidden border transition sm:h-[82px] sm:w-[68px] ${
                  isSelected ||
                  isSelectedVariant
                    ? "border-2 border-[#D4A437]"
                    : "border border-[#E5D8C7] hover:border-[#D4A437]"
                }`}
              >
                <Image
                  src={item.image}
                  alt={
                    item.type ===
                    "variant"
                      ? item.variantName
                      : `Thumbnail ${
                          index + 1
                        }`
                  }
                  fill
                  unoptimized
                  className="object-cover"
                />

                {/* Variant label */}
                {item.type ===
                  "variant" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#004831]/90 px-1 py-1 text-[7px] font-medium uppercase tracking-[0.05em] text-white">
                    {item.variantName}
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Variant count */}
      {variantImages.length > 0 && (
        <p className="text-[9px] uppercase tracking-[0.14em] text-[#A98A62]">
          {variantImages.length}{" "}
          {variantImages.length === 1
            ? "colour"
            : "colours"}{" "}
          available
        </p>
      )}
    </div>
  );
}