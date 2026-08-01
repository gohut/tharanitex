"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  {
    label: "Collections",
    href: "/search",
    icon: Package,
  },
  {
    label: "Your Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    label: "Your Account",
    href: "/profile",
    icon: User,
  },
];

export default function Navbar() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-[78px] bg-[#F8F2E8]/95 backdrop-blur-md border-b border-[#E8DCC8]">
        <div className="max-w-[1440px] mx-auto h-full px-5 md:px-8 lg:px-10 grid grid-cols-[1fr_auto_1fr] items-center">

          {/* Left */}
          <div className="flex items-center justify-start">
            <button
              aria-label="Open Menu"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
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
            <Link href="/home" aria-label="Go to home">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="h-[58px] md:h-[60px] w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
                draggable={false}
              />
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-3 md:gap-5 lg:gap-7">

            <button
              aria-label="Search"
              onClick={() => router.push("/search")}
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
              onClick={() => router.push("/wishlist")}
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
              onClick={() => router.push("/cart")}
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

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Close Menu"
            onClick={closeSidebar}
            className="absolute inset-0 h-full w-full bg-[#2F2B27]/35 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-[min(86vw,360px)] flex-col border-r border-[#E8DCC8] bg-[#F8F2E8] px-7 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link href="/home" onClick={closeSidebar} aria-label="Go to home">
                <img
                  src="/assets/logo.png"
                  alt="Tharani Textiles"
                  className="h-16 w-auto object-contain"
                  draggable={false}
                />
              </Link>

              <button
                aria-label="Close Menu"
                onClick={closeSidebar}
                className="rounded-full p-2 text-[#2F2B27] transition hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
              >
                <X size={22} strokeWidth={1.8} />
              </button>
            </div>

            <nav className="mt-10 space-y-3">
              {sidebarLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeSidebar}
                  className="flex items-center gap-4 border-b border-[#E8DCC8] px-1 py-4 text-[17px] font-medium tracking-[0.04em] text-[#2F2B27] transition hover:text-[#C79A2B]"
                >
                  <Icon size={20} strokeWidth={1.7} className="text-[#C79A2B]" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-[#E8DCC8] pt-6">
              <Link
                href="/login"
                onClick={closeSidebar}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#5A1F2F] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#471825]"
              >
                <LogIn size={18} strokeWidth={1.8} />
                Log In
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
