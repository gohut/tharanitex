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
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants?.length ? Number(variants[0].id) : null
  );

  const [wishlisted, setWishlisted] = useState(false);
  const scrollerRef = useRef(null);

  /*
   * Identify active variant object
   */
  const activeVariant = useMemo(() => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    return (
      variants.find(
        (v) =>
          Number(v.id) === Number(selectedVariantId) &&
          v.isActive !== false
      ) ||
      variants.find((v) => v.isActive !== false) ||
      null
    );
  }, [variants, selectedVariantId]);

  /*
   * Normal product images.
   * These follow variant images so customers can browse additional photography.
   */
  const productImages = useMemo(() => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter(Boolean);
  }, [images]);

  /*
   * Build gallery items:
   * 1. All images belonging to the currently selected variant
   * 2. Followed by common product images (without duplicate URLs)
   */
  const galleryItems = useMemo(() => {
    const items = [];
    const usedImages = new Set();

    if (activeVariant) {
      let variantImgs = [];
      if (Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
        variantImgs = activeVariant.images
          .map((img) =>
            typeof img === "string" ? img : img?.imageUrl || img?.image_url
          )
          .filter(Boolean);
      } else if (activeVariant.imageUrl || activeVariant.image_url) {
        variantImgs = [activeVariant.imageUrl || activeVariant.image_url];
      }

      variantImgs.forEach((imgUrl, idx) => {
        if (!usedImages.has(imgUrl)) {
          usedImages.add(imgUrl);
          items.push({
            type: "variant",
            variantId: activeVariant.id,
            variantName: activeVariant.name || "Variant",
            image: imgUrl,
            imageIndex: idx,
          });
        }
      });
    }

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
  }, [activeVariant, productImages]);

  /*
   * ProductDetails -> ProductGallery
   * When customer selects a variant in ProductDetails, switch gallery to that variant.
   */
  useEffect(() => {
    const handleVariantChange = (event) => {
      const variantId = event.detail?.variantId ?? null;
      const newId = variantId ? Number(variantId) : null;

      setSelectedVariantId(newId);
      setSelected(0);

      requestAnimationFrame(() => {
        scrollToIndex(0);
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
  }, []);

  /*
   * Initial variant selection synchronization
   */
  useEffect(() => {
    if (!variants?.length) return;

    if (!selectedVariantId) {
      const first = variants.find((v) => v.isActive !== false) || variants[0];
      if (first) {
        setSelectedVariantId(Number(first.id));
      }
    }
  }, [variants, selectedVariantId]);

  /*
   * Keep thumbnail position synchronized when customer swipes main gallery
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      const width = scroller.clientWidth || 1;
      const index = Math.round(scroller.scrollLeft / width);

      setSelected(
        Math.max(
          0,
          Math.min(index, galleryItems.length - 1)
        )
      );
    };

    scroller.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
    };
  }, [galleryItems.length]);

  /*
   * Scroll main gallery to a particular item index
   */
  function scrollToIndex(index) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const child = scroller.children[index];
    if (!child) return;

    child.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  /*
   * Thumbnail click handler
   */
  function handleThumbnailClick(item, index) {
    setSelected(index);
    scrollToIndex(index);

    if (item.type === "variant" && item.variantId) {
      setSelectedVariantId(Number(item.variantId));

      window.dispatchEvent(
        new CustomEvent("tharani-product-variant-select", {
          detail: {
            variantId: Number(item.variantId),
          },
        })
      );
    }
  }

  /*
   * No images fallback
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
          {galleryItems.map((item, index) => (
            <div
              key={`${item.image}-${index}`}
              className="relative h-full w-full shrink-0 snap-start"
            >
              <Image
                src={item.image}
                alt={
                  item.type === "variant"
                    ? `${item.variantName} - Image ${index + 1}`
                    : `Product image ${index + 1}`
                }
                fill
                priority={index === 0}
                unoptimized
                draggable={false}
                className="select-none object-cover"
              />

              {/* Show variant name badge on variant photos */}
              {item.type === "variant" && (
                <div className="absolute bottom-3 left-3 z-10 bg-[#004831]/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {item.variantName}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={() => setWishlisted((current) => !current)}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            wishlisted ? "bg-[#004831]" : "bg-white"
          }`}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={18}
            height={18}
            className={`object-contain transition-all duration-300 ${
              wishlisted ? "brightness-0 invert" : ""
            }`}
          />
        </button>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {galleryItems.map((item, index) => {
          const isSelected = selected === index;

          return (
            <button
              type="button"
              key={`${item.image}-thumb-${index}`}
              onClick={() => handleThumbnailClick(item, index)}
              aria-label={
                item.type === "variant"
                  ? `View ${item.variantName} photo ${index + 1}`
                  : `View product image ${index + 1}`
              }
              className={`relative h-[74px] w-[62px] shrink-0 overflow-hidden border transition sm:h-[82px] sm:w-[68px] ${
                isSelected
                  ? "border-2 border-[#D4A437]"
                  : "border border-[#E5D8C7] hover:border-[#D4A437]"
              }`}
            >
              <Image
                src={item.image}
                alt={
                  item.type === "variant"
                    ? `${item.variantName} thumbnail ${index + 1}`
                    : `Thumbnail ${index + 1}`
                }
                fill
                unoptimized
                className="object-cover"
              />

              {item.type === "variant" && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#004831]/90 px-1 py-0.5 text-[7px] font-medium uppercase tracking-[0.05em] text-white">
                  {item.variantName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Variant count */}
      {Array.isArray(variants) && variants.length > 0 && (
        <p className="text-[9px] uppercase tracking-[0.14em] text-[#A98A62]">
          {variants.length} {variants.length === 1 ? "variant" : "variants"} available
        </p>
      )}
    </div>
  );
}