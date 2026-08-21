"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import toast from "react-hot-toast";

export default function ProductGallery({
  images,
  productId,
}) {
  const [selected, setSelected] =
    useState(0);

  const [wishlisted, setWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const scrollerRef =
    useRef(null);

  useEffect(() => {
    const scroller =
      scrollerRef.current;

    if (!scroller) return;

    const handleScroll = () => {
      const width =
        scroller.clientWidth || 1;

      const nextIndex =
        Math.round(
          scroller.scrollLeft /
            width
        );

      setSelected(
        Math.max(
          0,
          Math.min(
            nextIndex,
            images.length - 1
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
  }, [images.length]);

  /*
   * Load the actual wishlist state
   * from the database.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadWishlistState() {
      try {
        const response =
          await fetch(
            "/api/wishlist",
            {
              credentials:
                "include",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const wishlistItems =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.data
              )
              ? data.data
              : [];

        const exists =
          wishlistItems.some(
            (item) =>
              String(
                item.product_id ??
                  item.id
              ) ===
              String(productId)
          );

        if (!cancelled) {
          setWishlisted(exists);
        }
      } catch (error) {
        console.error(
          "Failed to load wishlist state:",
          error
        );
      }
    }

    if (productId) {
      loadWishlistState();
    }

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const selectImage = (
    index
  ) => {
    setSelected(index);

    scrollerRef.current
      ?.children[index]
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  };

  const toggleWishlist =
    async () => {
      if (wishlistLoading) {
        return;
      }

      try {
        setWishlistLoading(true);

        const response =
          await fetch(
            "/api/wishlist",
            {
              method: wishlisted
                ? "DELETE"
                : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                productId,
              }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (
          response.status ===
          401
        ) {
          toast.error(
            "Please sign in to use your wishlist."
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to update wishlist"
          );
        }

        setWishlisted(
          (previous) =>
            !previous
        );

        toast.success(
          wishlisted
            ? "Removed from wishlist"
            : "Added to wishlist"
        );
      } catch (error) {
        console.error(
          "Wishlist update failed:",
          error
        );

        toast.error(
          error.message ||
            "Unable to update wishlist."
        );
      } finally {
        setWishlistLoading(false);
      }
    };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">

      {/* MAIN IMAGE */}
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
          {images.map(
            (image, index) => (
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
                  alt={`Product image ${
                    index + 1
                  }`}
                  fill
                  priority={
                    index === 0
                  }
                  unoptimized
                  draggable={false}
                  className="select-none object-cover"
                />
              </div>
            )
          )}
        </div>

        {/* FUNCTIONAL WISHLIST */}
        <button
          type="button"
          data-requires-auth="true"
          onClick={toggleWishlist}
          disabled={
            wishlistLoading
          }
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`
            absolute
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            shadow-md
            transition-all
            duration-300
            hover:scale-110
            active:scale-95
            disabled:cursor-wait
            disabled:opacity-60
            ${
              wishlisted
                ? "bg-[#00361F]"
                : "bg-white"
            }
          `}
        >
          <Image
            src="/assets/wishlist_icon.png"
            alt=""
            width={18}
            height={18}
            className={`
              object-contain
              ${
                wishlisted
                  ? "brightness-0 invert"
                  : ""
              }
            `}
          />
        </button>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {images.map(
          (image, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                selectImage(index)
              }
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
                    ? "border-[#D4A437]"
                    : "border-[#E5D8C7] hover:border-[#D4A437]"
                }
              `}
            >
              <Image
                src={image}
                alt={`Thumbnail ${
                  index + 1
                }`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          )
        )}
      </div>
    </div>
  );
}