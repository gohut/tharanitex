"use client";

import { Menu, Search, Heart, ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full h-[76px] bg-[#F8F2E8] border-b border-[#E8DCC8]">
      <div className="max-w-[1440px] h-full mx-auto px-8 lg:px-10 grid grid-cols-[1fr_auto_1fr] items-center">

        {/* Left */}
        <div className="flex justify-start">
          <button
            aria-label="Open Menu"
            className="p-1 hover:opacity-70 transition"
          >
            <Menu
              size={28}
              strokeWidth={1.8}
              className="text-black"
            />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Tharani Textiles"
            className="h-[54px] w-auto object-contain"
          />
        </div>

        {/* Right */}
        <div className="flex justify-end items-center gap-9">

          <button
            className="hover:opacity-70 transition"
            aria-label="Search"
          >
            <Search
              size={24}
              strokeWidth={1.8}
            />
          </button>

          <button
            className="hover:opacity-70 transition"
            aria-label="Wishlist"
          >
            <Heart
              size={24}
              strokeWidth={1.8}
            />
          </button>

          <button
            className="hover:opacity-70 transition"
            aria-label="Cart"
          >
            <ShoppingBag
              size={24}
              strokeWidth={1.8}
            />
          </button>

        </div>

      </div>
    </header>
  );
}