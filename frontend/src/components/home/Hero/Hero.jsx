"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "./hero.css";

import heroSlides from "@/data/hero";

export default function Hero() {
  return (
    <section className="hero-section">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        speed={900}
        grabCursor={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <img
              src={slide.image}
              alt={`Hero Banner ${slide.id}`}
              className="hero-image"
              draggable={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}