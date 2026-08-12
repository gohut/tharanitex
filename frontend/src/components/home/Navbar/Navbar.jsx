"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { searchProducts } from "@/data/customerOrders";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(pathname === "/search");
  const [navbarSearch, setNavbarSearch] = useState(searchParams.get("q") || "");

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSearch = (event) => {
    event.preventDefault();
    const query = sidebarSearch.trim();
    closeSidebar();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const searchMatches = navbarSearch.trim()
    ? searchProducts.filter((product) =>
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(navbarSearch.trim().toLowerCase())
      ).slice(0, 4)
    : [];

  const updateNavbarSearch = (value) => {
    setNavbarSearch(value);
    const query = value.trim();
    router.replace(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const closeSearchMode = () => {
    setIsSearchMode(false);
    setNavbarSearch("");
    router.push("/home");
  };

  return (
    <>
      <header className="sticky top-0 z-50 min-h-16 w-full border-b border-[#E8DCC8] bg-[#F8F2E8]/95 backdrop-blur-md md:h-[78px]">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-2 px-3 md:grid md:h-full md:grid-cols-[1fr_auto_1fr] md:px-8 lg:px-10">

          {/* Left */}
          <div className={`flex shrink-0 items-center justify-start ${isSearchMode ? "md:flex" : ""}`}>
            {/* Desktop: keep hamburger exactly as before */}
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

            {/* Mobile: Home page → logo */}
            {!isSearchMode && (pathname === "/" || pathname === "/home") && (
              <Link
                href="/home"
                aria-label="Go to home"
                className="flex md:hidden"
              >
                <img
                  src="/assets/logo.png"
                  alt="Tharani Textiles"
                  className="h-10 w-auto max-w-full object-contain"
                  draggable={false}
                />
              </Link>
            )}

            {/* Mobile: Other pages → Back button */}
            {!isSearchMode && pathname !== "/" && pathname !== "/home" && (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95 md:hidden"
              >
                <ArrowLeft
                  size={24}
                  strokeWidth={1.8}
                  className="text-[#2F2B27]"
                />
              </button>
            )}
          </div>

          {/* Logo - centered on mobile inner pages, desktop unchanged */}
            <div
              className={`flex flex-1 justify-center md:flex-none ${
                isSearchMode || pathname === "/" || pathname === "/home" ? "hidden md:flex" : ""
              }`}
            >
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
          {isSearchMode ? (
            <div className="relative flex min-w-0 flex-1 items-center gap-1 md:col-span-2 md:col-start-2 md:row-start-1">
              <Search size={18} className="pointer-events-none absolute left-3 text-[#8A7A65]" />
              <input
                type="search"
                autoFocus
                value={navbarSearch}
                onChange={(event) => updateNavbarSearch(event.target.value)}
                placeholder="Search sarees"
                className="h-11 min-w-0 flex-1 border border-[#CDBB9E] bg-white pl-10 pr-10 text-base text-[#2F2B27] outline-none focus:border-[#C79A2B]"
              />
              {navbarSearch && <button type="button" aria-label="Clear search" onClick={() => updateNavbarSearch("")} className="absolute right-12 flex h-10 w-10 items-center justify-center text-[#2F2B27]"><X size={18} /></button>}
              <button type="button" aria-label="Close search" onClick={closeSearchMode} className="flex h-11 w-11 shrink-0 items-center justify-center text-[#2F2B27] transition hover:bg-[#F1E6D5]"><X size={22} /></button>
              {searchMatches.length > 0 && (
                <div className="absolute left-0 right-12 top-[calc(100%+8px)] max-h-[min(60vh,360px)] overflow-y-auto border border-[#E8DCC8] bg-[#FFFDF9] p-2 shadow-lg">
                  {searchMatches.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug || `product-${product.id}`}`} className="flex min-h-16 items-center gap-3 border-b border-[#EEE4D5] p-2 last:border-b-0 hover:bg-[#F8F2E8]">
                      <img src={product.image} alt="" className="h-12 w-10 shrink-0 object-cover" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-[#2F2B27]">{product.name}</span><span className="block truncate text-xs text-[#8A7A65]">{product.category}</span></span>
                      <span className="shrink-0 text-sm font-medium text-[#C79A2B]">{product.price}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <div className="flex items-center justify-end gap-1 md:gap-5 lg:gap-7">

            <button
              aria-label="Search"
              onClick={() => { setIsSearchMode(true); router.push("/search"); }}
              className="flex h-10 w-10 items-center justify-center transition-all duration-300 hover:bg-[#F1E6D5] hover:scale-105 active:scale-95"
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
                className="h-6 w-6 object-contain md:h-7 md:w-7"
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
          )}

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
                  className="h-12 w-full border border-[#E8DCC8] bg-white pl-11 pr-4 text-sm text-[#2F2B27] outline-none transition focus:border-[#C79A2B]"
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
