"use client";

import { Menu, Search, ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full h-[78px] bg-[#F8F2E8]/95 backdrop-blur-md border-b border-[#E8DCC8]">
      <div className="max-w-[1440px] mx-auto h-full px-5 md:px-8 lg:px-10 grid grid-cols-[1fr_auto_1fr] items-center">

        {/* Left */}
        <div className="flex items-center justify-start">
          <button
            aria-label="Open Menu"
            className="rounded-full p-2 transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
          >
            <Menu
              size={24}
              strokeWidth={1.8}
              className="text-[#2F2B27]"
            />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Tharani Textiles"
            className="h-[58px] md:h-[60px] w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
            draggable={false}
          />
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3 md:gap-5 lg:gap-7">

          <button
            aria-label="Search"
            className="rounded-full p-2 transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
          >
            <Search
              size={22}
              strokeWidth={1.8}
              className="text-[#2F2B27]"
            />
          </button>

          <button
            aria-label="Wishlist"
            className="rounded-full p-1 transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
          >
            <img
              src="/assets/wishlist.png"
              alt="Wishlist"
              className="w-8 h-8 md:w-9 md:h-9"
              draggable={false}
            />
          </button>

          <button
            aria-label="Cart"
            className="rounded-full p-2 transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
          >
            <ShoppingBag
              size={22}
              strokeWidth={1.8}
              className="text-[#2F2B27]"
            />
          </button>

        </div>

      </div>
    </header>
  );
}