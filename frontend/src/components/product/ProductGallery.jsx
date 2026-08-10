"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const horizontalSwipe = useRef(false);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    horizontalSwipe.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    if (!horizontalSwipe.current && Math.abs(dx) < Math.abs(dy)) {
      setIsDragging(false);
      return;
    }

    if (Math.abs(dx) > 8) {
      horizontalSwipe.current = true;
      setDragX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (horizontalSwipe.current) {
      if (dragX < -50 && selected < images.length - 1) {
        setSelected((current) => current + 1);
      } else if (dragX > 50 && selected > 0) {
        setSelected((current) => current - 1);
      }
    }

    setDragX(0);
    setIsDragging(false);
    horizontalSwipe.current = false;
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div
        className="relative aspect-[0.82] w-full overflow-hidden border border-[#E8DDCE] bg-[#F4EBDD] sm:aspect-[0.78]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className={`flex h-full w-full ${isDragging ? "transition-none" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateX(calc(-${selected * 100}% + ${dragX}px))`,
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="relative h-full min-w-full shrink-0">
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                fill
                priority={index === 0}
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className={`absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 sm:h-9 sm:w-9 ${
            wishlisted ? "bg-[#5B2333]" : "bg-white"
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

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative h-[68px] w-[56px] shrink-0 overflow-hidden border transition sm:h-[74px] sm:w-[62px] ${
              selected === index
                ? "border-[#C79127]"
                : "border-[#E5D8C7] hover:border-[#C79127]"
            }`}
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
