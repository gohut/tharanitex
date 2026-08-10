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
        className="hero-swiper w-full"
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
                className="hero-image h-full w-full object-contain"
                draggable={false}
              />

              {(slide.title ||
                slide.subtitle ||
                slide.buttonText) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
                    <div className="max-w-[18rem] sm:max-w-xl">
                      {slide.title && (
                        <h1 className="text-2xl font-light leading-tight text-white sm:text-4xl md:text-6xl">
                          {slide.title}
                        </h1>
                      )}

                      {slide.subtitle && (
                        <p className="mt-2 text-xs leading-5 text-white/90 sm:mt-4 sm:text-lg">
                          {slide.subtitle}
                        </p>
                      )}

                      {slide.buttonText && slide.buttonLink && (
                        <a
                          href={slide.buttonLink}
                          className="mt-4 inline-flex min-h-10 items-center bg-[#D4A437] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:mt-7 sm:min-h-11 sm:px-7 sm:py-3 sm:text-sm"
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
