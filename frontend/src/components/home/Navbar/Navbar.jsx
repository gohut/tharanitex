"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingCart,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
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
  const [sidebarSearch, setSidebarSearch] = useState("");

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSearch = (event) => {
    event.preventDefault();
    const query = sidebarSearch.trim();
    closeSidebar();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-[#E8DCC8] bg-[#F8F2E8]/95 backdrop-blur-md md:h-[78px]">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8 lg:px-10">

          {/* Left */}
          <div className="flex items-center justify-start">
            <button
              aria-label="Open Menu"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95 md:flex"
            >
              <Menu
                size={24}
                strokeWidth={1.8}
                className="text-[#2F2B27]"
              />
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-1 justify-start md:flex-none md:justify-center">
            <Link href="/home" aria-label="Go to home">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="h-10 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-[1.02] md:h-[60px]"
                draggable={false}
              />
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-1 md:gap-5 lg:gap-7">

            <button
              aria-label="Search"
              onClick={() => router.push("/search")}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
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
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
            >
              <img
                src="/assets/wishlist_icon.png"
                alt="Wishlist"
                className="h-7 w-7 object-contain md:h-9 md:w-9"
                draggable={false}
              />
            </button>

            <button
              aria-label="Cart"
              onClick={() => router.push("/cart")}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
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

          <aside className="relative flex h-full w-[min(88vw,360px)] flex-col border-r border-[#E8DCC8] bg-[#F8F2E8] px-5 py-5 shadow-2xl sm:px-7 sm:py-6">
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

            <form onSubmit={openSearch} className="mt-6">
              <label className="relative block">
                <Search
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7A65]"
                />
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(event) => setSidebarSearch(event.target.value)}
                  placeholder="Search collections"
                  className="h-12 w-full rounded-full border border-[#E8DCC8] bg-white pl-11 pr-4 text-sm text-[#2F2B27] outline-none transition focus:border-[#C79A2B]"
                />
              </label>
            </form>

            <nav className="mt-8 space-y-3">
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
          </aside>
        </div>
      )}
    </>
  );
}
