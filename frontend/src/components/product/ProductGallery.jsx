"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      const width = scroller.clientWidth || 1;
      const nextIndex = Math.round(scroller.scrollLeft / width);

      setSelected(
        Math.max(0, Math.min(nextIndex, images.length - 1))
      );
    };

    scroller.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      scroller.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  const selectImage = (index) => {
    setSelected(index);

    scrollerRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">

      {/* ================================================= */}
      {/* MAIN PRODUCT IMAGE */}
      {/* Mobile: remove ONLY the space around this image */}
      {/* ================================================= */}

      <div
        className="
          relative
          -mx-4
          -mt-4
          w-[calc(100%+2rem)]
          aspect-[0.82]
          overflow-hidden
          border
          border-[#E8DDCE]
          bg-[#F4EBDD]

          sm:mx-0
          sm:mt-0
          sm:w-full
          sm:aspect-[0.78]
        "
      >
        <div
          ref={scrollerRef}
          className="
            flex
            h-full
            w-full
            snap-x
            snap-mandatory
            overflow-x-auto
            overscroll-x-contain
            scroll-smooth
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="
                relative
                h-full
                w-full
                shrink-0
                snap-start
              "
            >
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                fill
                priority={index === 0}
                unoptimized
                draggable={false}
                className="select-none object-cover"
              />
            </div>
          ))}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className={`
            absolute
            right-2.5
            top-2.5
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            shadow-md
            transition-all
            duration-300
            hover:scale-110
            active:scale-95
            sm:h-9
            sm:w-9
            ${
              wishlisted
                ? "bg-[#00361f]"
                : "bg-white"
            }
          `}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={18}
            height={18}
            className={`
              object-contain
              transition-all
              duration-300
              ${wishlisted ? "brightness-0 invert" : ""}
            `}
          />
        </button>
      </div>

      {/* ================================================= */}
      {/* THUMBNAILS */}
      {/* KEEP THEIR ORIGINAL SPACING */}
      {/* ================================================= */}

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => selectImage(index)}
            className={`
              relative
              h-[68px]
              w-[56px]
              shrink-0
              overflow-hidden
              border
              transition
              sm:h-[74px]
              sm:w-[62px]
              ${
                selected === index
                  ? "border-[#C79127]"
                  : "border-[#E5D8C7] hover:border-[#C79127]"
              }
            `}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}