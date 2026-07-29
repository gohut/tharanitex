"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function RelatedProducts({ products }) {
  return (
    <section className="mt-20 mb-20">

      <div className="mb-10 flex items-center justify-between">

        <div className="flex items-center gap-6">

          <div className="h-px w-24 bg-[#D9C7A4]" />

          <h2 className="font-serif text-[46px] uppercase text-[#C48B2A]">
            You May Also Like
          </h2>

        </div>

        <div className="flex gap-3">

          <button className="related-prev flex h-12 w-12 items-center justify-center rounded-full border border-[#D9C7A4] bg-white transition-all duration-300 hover:bg-[#5B2333] hover:text-white">

            <ChevronLeft size={22} />

          </button>

          <button className="related-next flex h-12 w-12 items-center justify-center rounded-full border border-[#D9C7A4] bg-white transition-all duration-300 hover:bg-[#5B2333] hover:text-white">

            <ChevronRight size={22} />

          </button>

        </div>

      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: ".related-prev",
          nextEl: ".related-next",
        }}
        loop={true}
        spaceBetween={30}
        breakpoints={{
          0: {
            slidesPerView: 1.2,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1280: {
            slidesPerView: 4,
          },
        }}
      >

        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <RelatedCard product={product} />
          </SwiperSlide>
        ))}

      </Swiper>

    </section>
  );
}

function RelatedCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group transition-all duration-300 hover:-translate-y-1 cursor-pointer">

      <div className="relative overflow-hidden rounded-sm bg-[#FBF8F4] shadow-sm transition-all duration-300 group-hover:shadow-lg">

        <div className="relative aspect-[3/4] overflow-hidden">

          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />

        </div>

        {/* Wishlist */}

        <button
          onClick={() => setWishlisted(!wishlisted)}
          className={`
            absolute
            top-3
            right-3
            z-20
            w-10
            h-10
            rounded-full
            flex
            items-center
            justify-center
            shadow-md
            transition-all
            duration-300
            hover:scale-110
            active:scale-95
            ${
              wishlisted
                ? "bg-[#5B2333]"
                : "bg-white"
            }
          `}
        >

          <Image
            src="/assets/wishlist_icon.png"
            alt="Wishlist"
            width={32}
            height={32}
            className={`transition-all duration-300 ${
              wishlisted ? "brightness-0 invert" : ""
            }`}
          />

        </button>

        {/* Cart */}

        <button
          className="
            absolute
            bottom-3
            right-3
            z-20
            w-10
            h-10
            rounded-full
            bg-white
            shadow-md
            flex
            items-center
            justify-center
            transition-all
            duration-300
            hover:bg-[#5B2333]
            hover:text-white
            hover:scale-110
            active:scale-95
          "
        >

          <ShoppingBag size={20} strokeWidth={2} />

        </button>

      </div>

      <h3 className="mt-5 line-clamp-2 text-[17px] font-medium leading-snug text-[#3E3328] transition-colors duration-300 group-hover:text-[#C48B2A]">

        {product.name}

      </h3>

      <p className="mt-2 uppercase tracking-[2px] text-[11px] text-[#C39A32]">

        {product.category}

      </p>

      <div className="mt-3 flex items-center justify-between">

        <p className="text-[28px] font-medium text-[#C48B2A]">

          ₹{product.price}

        </p>

        <div className="flex items-center gap-1">

          <Star
            size={16}
            fill="#F3A900"
            color="#F3A900"
          />

          <span className="text-sm text-gray-600">

            {product.rating}

          </span>

        </div>

      </div>

    </div>
  );
}