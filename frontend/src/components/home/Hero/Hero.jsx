"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "./hero.css";

export default function Hero({ slides = [] }) {
  if (!slides.length) {
    return null;
  }

  return (
    <section className="hero-section">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        speed={900}
        grabCursor={true}
        autoplay={
          slides.length > 1
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{
          clickable: true,
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative">
              <img
                src={slide.image}
                alt={slide.title || `Hero Banner ${slide.id}`}
                className="hero-image"
                draggable={false}
              />

              {(slide.title ||
                slide.subtitle ||
                slide.buttonText) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-[1400px] px-8">
                    <div className="max-w-xl">
                      {slide.title && (
                        <h1 className="text-4xl font-light text-white md:text-6xl">
                          {slide.title}
                        </h1>
                      )}

                      {slide.subtitle && (
                        <p className="mt-4 text-lg text-white/90">
                          {slide.subtitle}
                        </p>
                      )}

                      {slide.buttonText && slide.buttonLink && (
                        <a
                          href={slide.buttonLink}
                          className="mt-7 inline-block bg-[#D4A437] px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          {slide.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}