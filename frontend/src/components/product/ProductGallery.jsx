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
}) {
  const [selected, setSelected] = useState(0);
  const [wishlisted, setWishlisted] =
    useState(false);

  const [variantImage, setVariantImage] =
    useState("");

  const [selectedVariantId, setSelectedVariantId] =
    useState(null);

  const scrollerRef = useRef(null);

  /*
   * Build the gallery list.
   *
   * When a variant is selected, its image is
   * placed FIRST so it becomes the main image.
   *
   * The normal product images remain available
   * underneath as additional gallery images.
   */
  const galleryImages = useMemo(() => {
    const cleanImages = Array.isArray(images)
      ? images.filter(Boolean)
      : [];

    if (!variantImage) {
      return cleanImages;
    }

    const withoutDuplicateVariantImage =
      cleanImages.filter(
        (image) => image !== variantImage
      );

    return [
      variantImage,
      ...withoutDuplicateVariantImage,
    ];
  }, [images, variantImage]);

  /*
   * Listen for variant changes from
   * ProductDetails.
   */
  useEffect(() => {
    const handleVariantChange = (event) => {
      const nextVariantId =
        event.detail?.variantId ?? null;

      const nextImage =
        event.detail?.imageUrl || "";

      setSelectedVariantId(
        nextVariantId
      );

      setVariantImage(nextImage);

      /*
       * Whenever a colour is selected,
       * automatically show that colour's image.
       */
      setSelected(0);

      requestAnimationFrame(() => {
        if (scrollerRef.current) {
          scrollerRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        }
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
   * Keep the thumbnail indicator synchronized
   * with horizontal swiping.
   */
  useEffect(() => {
    const scroller =
      scrollerRef.current;

    if (!scroller) return;

    const handleScroll = () => {
      const width =
        scroller.clientWidth || 1;

      const nextIndex = Math.round(
        scroller.scrollLeft / width
      );

      setSelected(
        Math.max(
          0,
          Math.min(
            nextIndex,
            galleryImages.length - 1
          )
        )
      );
    };

    scroller.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      scroller.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [galleryImages.length]);

  /*
   * If gallery data changes, make sure the
   * selected index remains valid.
   */
  useEffect(() => {
    if (!galleryImages.length) {
      setSelected(0);
      return;
    }

    setSelected((current) =>
      Math.min(
        current,
        galleryImages.length - 1
      )
    );
  }, [galleryImages.length]);

  const selectImage = (index) => {
    setSelected(index);

    scrollerRef.current?.children[
      index
    ]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  /*
   * No images available.
   */
  if (!galleryImages.length) {
    return (
      <div className="flex aspect-[0.82] w-full items-center justify-center border border-[#E8DDCE] bg-[#F4EBDD] text-sm text-[#8A7C6A] sm:aspect-[0.78]">
        Product image unavailable
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* MAIN IMAGE */}
      <div className="relative aspect-[0.82] w-full overflow-hidden border border-[#E8DDCE] bg-[#F4EBDD] sm:aspect-[0.78]">
        <div
          ref={scrollerRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryImages.map(
            (image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative h-full w-full shrink-0 snap-start"
              >
                <Image
                  src={image}
                  alt={
                    index === 0 &&
                    variantImage
                      ? "Selected variant"
                      : `Product image ${
                          index + 1
                        }`
                  }
                  fill
                  priority={index === 0}
                  unoptimized
                  draggable={false}
                  className="select-none object-cover"
                />
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

        {/* VARIANT LABEL */}
        {variantImage &&
          selectedVariantId && (
            <div className="absolute bottom-3 left-3 z-10 border border-white/60 bg-[#004831]/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Selected Variant
            </div>
          )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {galleryImages.map(
          (image, index) => (
            <button
              type="button"
              key={`${image}-thumb-${index}`}
              onClick={() =>
                selectImage(index)
              }
              className={`relative h-[74px] w-[62px] shrink-0 overflow-hidden border transition sm:h-[82px] sm:w-[68px] ${
                selected === index
                  ? "border-2 border-[#D4A437]"
                  : "border border-[#E5D8C7] hover:border-[#D4A437]"
              }`}
            >
              <Image
                src={image}
                alt={
                  index === 0 &&
                  variantImage
                    ? "Selected variant thumbnail"
                    : `Thumbnail ${
                        index + 1
                      }`
                }
                fill
                unoptimized
                className="object-cover"
              />

              {/* Mark the variant image */}
              {index === 0 &&
                variantImage && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#004831]/90 px-1 py-0.5 text-[7px] uppercase tracking-[0.08em] text-white">
                    Variant
                  </span>
                )}
            </button>
          )
        )}
      </div>
    </div>
  );
}