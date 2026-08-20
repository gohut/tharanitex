"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Loader2,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

  useEffect(() => {
    if (!isSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isSidebarOpen]);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [navbarSearch, setNavbarSearch] = useState(
    searchParams.get("q") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || ""
  );

  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const isSearchMode = pathname === "/search";
  const showActiveSearch = isSearchMode || isSearchActive;

  // Fetch product catalog once mounted
  useEffect(() => {
    let active = true;

    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Sync search input from URL when on /search
  useEffect(() => {
    if (!isSearchMode) return;
    const q = searchParams.get("q") || "";
    const timer = setTimeout(() => {
      setNavbarSearch(q);
      setDebouncedSearch(q);
    }, 0);
    return () => clearTimeout(timer);
  }, [isSearchMode, searchParams]);

  // Debounce search input changes by 250ms with stale request protection
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(navbarSearch);
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [navbarSearch]);

  // Click outside listener to close search dropdown & deactivate navbar search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        if (!isSearchMode) {
          setIsSearchActive(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchMode]);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const activateSearch = () => {
    setIsSearchActive(true);
    setIsDropdownOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    if (isSearchMode) {
      setNavbarSearch("");
      router.push("/home");
    }
  };

  const openSearchFromSidebar = (event) => {
    event.preventDefault();
    closeSidebar();
    if (sidebarSearch.trim()) {
      setNavbarSearch(sidebarSearch.trim());
    }
    activateSearch();
  };

  const searchMatches = useMemo(
    () =>
      debouncedSearch.trim()
        ? products
            .filter((product) => {
              if (!product.slug) return false;
              const searchable = `${product.name} ${product.category || ""} ${product.description || ""}`.toLowerCase();
              return searchable.includes(debouncedSearch.trim().toLowerCase());
            })
            .slice(0, 5)
        : [],
    [debouncedSearch, products]
  );

  const totalMatchesCount = useMemo(
    () =>
      debouncedSearch.trim()
        ? products.filter((product) => {
            if (!product.slug) return false;
            const searchable = `${product.name} ${product.category || ""} ${product.description || ""}`.toLowerCase();
            return searchable.includes(debouncedSearch.trim().toLowerCase());
          }).length
        : 0,
    [debouncedSearch, products]
  );

  const updateNavbarSearch = (value) => {
    setNavbarSearch(value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsDropdownOpen(true);
      setSelectedIndex((prev) =>
        prev < searchMatches.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchMatches[selectedIndex]) {
        const item = searchMatches[selectedIndex];
        setIsDropdownOpen(false);
        setIsSearchActive(false);
        router.push(`/product/${item.slug}`);
      } else if (navbarSearch.trim()) {
        const q = navbarSearch.trim();
        setIsDropdownOpen(false);
        setIsSearchActive(false);
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    } else if (e.key === "Escape") {
      deactivateSearch();
    }
  };

  const handleProductClick = (slug) => {
    setIsDropdownOpen(false);
    setIsSearchActive(false);
    router.push(`/product/${slug}`);
  };

  const handleViewAllResults = () => {
    if (!debouncedSearch.trim()) return;
    const q = debouncedSearch.trim();
    setIsDropdownOpen(false);
    setIsSearchActive(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-[#E8DCC8] bg-[#F8F2E8]/95 backdrop-blur-md md:h-[78px]">
        {/* Animated Search Bar Overlay */}
        <div
          className={`absolute inset-0 z-40 flex items-center px-4 md:px-8 lg:px-10 bg-[#F8F2E8] transition-all duration-300 ease-in-out ${
            showActiveSearch
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2.5 pointer-events-none"
          }`}
        >
          <div className="relative mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-3">
            {/* Left */}
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <button
                type="button"
                aria-label="Open Menu"
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-[#F1E6D5] active:scale-95"
              >
                <Menu size={24} strokeWidth={1.8} className="text-[#2F2B27]" />
              </button>

              <Link href="/home" aria-label="Go to home" className="hidden md:block shrink-0">
                <img
                  src="/assets/logo.png"
                  alt="Tharani Textiles"
                  className="h-10 w-auto object-contain md:h-[52px]"
                  draggable={false}
                />
              </Link>
            </div>

            {/* Center Search Container */}
            <div
              ref={searchContainerRef}
              className={`relative flex-1 transition-all duration-300 ease-out transform ${
                showActiveSearch ? "scale-100 opacity-100" : "scale-95 opacity-0"
              } md:mx-auto md:w-[min(38vw,480px)] md:flex-initial`}
            >
              <div className="relative flex items-center w-full border-b border-[#2F2B27]/40 pb-1 focus-within:border-[#C79A2B] transition-colors">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={navbarSearch}
                  onFocus={() => {
                    setIsFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  onChange={(event) => updateNavbarSearch(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search sarees..."
                  aria-label="Search products"
                  className="h-8 md:h-9 w-full bg-transparent pl-0 pr-14 text-xs md:text-sm font-medium text-[#2F2B27] placeholder:text-gray-400 outline-none border-none focus:outline-none focus:ring-0 shadow-none"
                />

                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {navbarSearch ? (
                    <button
                      type="button"
                      aria-label="Clear search text"
                      onClick={() => {
                        setNavbarSearch("");
                        setDebouncedSearch("");
                        setSelectedIndex(-1);
                        searchInputRef.current?.focus();
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 transition"
                    >
                      <X size={14} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={deactivateSearch}
                    className="flex h-7 w-7 items-center justify-center text-[#2F2B27] hover:text-[#C79A2B] transition"
                  >
                    <X size={18} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Live Real-Time Search Dropdown */}
              {isDropdownOpen && debouncedSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(65vh,440px)] overflow-hidden rounded-2xl border border-gray-200 bg-[#FFFDF9] shadow-2xl transition-all duration-200">
                  <div className="flex items-center justify-between border-b border-[#EEE4D5] bg-[#FBF5EA]/90 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[#8A7A65]">
                    <span>{isSearching ? "Searching collection..." : "Matching Sarees"}</span>
                    {!isSearching && (
                      <span className="rounded-full bg-[#E8DCC8]/60 px-2 py-0.5 text-[10px] text-[#5A4B38]">
                        {totalMatchesCount} {totalMatchesCount === 1 ? "result" : "results"}
                      </span>
                    )}
                  </div>

                  {searchMatches.length > 0 ? (
                    <div className="divide-y divide-[#F3E8D5] overflow-y-auto max-h-[280px]">
                      {searchMatches.map((product, index) => {
                        const fallbackImg = "/assets/logo.png";
                        const src = imageErrorMap[product.id] ? fallbackImg : product.image || fallbackImg;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex cursor-pointer items-center gap-3.5 px-4 py-3 transition-colors ${
                              index === selectedIndex
                                ? "bg-[#F8F2E8] ring-1 ring-gray-300"
                                : "hover:bg-[#F8F2E8]"
                            }`}
                          >
                            <img
                              src={src}
                              alt={product.name || "Product"}
                              onError={() =>
                                setImageErrorMap((prev) => ({ ...prev, [product.id]: true }))
                              }
                              className="h-12 w-10 shrink-0 rounded-lg border border-[#E8DCC8] object-cover bg-white"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-[#2F2B27]">
                                {product.name}
                              </span>
                              <span className="block truncate text-xs text-[#8A7A65]">
                                {product.category || "Silk Saree"}
                              </span>
                            </span>

                            <span className="shrink-0 text-xs font-semibold text-[#C79A2B]">
                              {product.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm font-medium text-[#2F2B27]">No sarees found matching “{debouncedSearch}”</p>
                      <p className="mt-1 text-xs text-[#8A7A65]">
                        Try searching for Banarasi, Kanchipuram, Soft Silk, or Linen.
                      </p>
                    </div>
                  )}

                  {totalMatchesCount > 0 && (
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="flex w-full items-center justify-between border-t border-[#EEE4D5] bg-[#FBF5EA] px-4 py-3 text-xs font-semibold text-[#0B3D2E] transition-colors hover:bg-[#F1E6D5]"
                    >
                      <span>View all {totalMatchesCount} results for “{debouncedSearch.trim()}”</span>
                      <ArrowRight size={15} className="text-[#C79A2B]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right */}
            <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-5 lg:gap-7">
              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => router.push("/wishlist")}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-[#F1E6D5] active:scale-95"
              >
                <img
                  src="/assets/wishlist_icon.png"
                  alt="Wishlist"
                  className="h-6 w-6 object-contain md:h-7 md:w-7"
                  draggable={false}
                />
              </button>

              <button
                type="button"
                aria-label="Cart"
                onClick={() => router.push("/cart")}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-[#F1E6D5] active:scale-95"
              >
                <ShoppingBag size={22} strokeWidth={1.8} className="text-[#2F2B27]" />
              </button>
            </div>
          </div>
        </div>

        {/* Normal Header Mode */}
        <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-3 sm:px-4 md:px-8 lg:px-10">
          {/* LEFT — MOBILE MENU / BACK BUTTON */}
          <div className="relative z-10 flex shrink-0 items-center">
            <div className="md:hidden">
              <button
                type="button"
                aria-label="Open Menu"
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#F1E6D5] active:scale-95"
              >
                <Menu
                  size={24}
                  strokeWidth={1.8}
                  className="text-[#2F2B27]"
                />
              </button>
            </div>

            <button
              type="button"
              aria-label="Open Menu"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-[#F1E6D5] active:scale-95 md:flex"
            >
              <Menu size={24} strokeWidth={1.8} className="text-[#2F2B27]" />
            </button>
          </div>

          {/* LOGO */}
          <div className="relative z-0 flex items-center justify-self-center md:static md:z-auto md:flex-1 md:justify-start">
            <Link href="/home" aria-label="Go to home">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="h-9 w-auto max-w-[135px] object-contain transition-transform duration-300 hover:scale-[1.02] sm:h-10 sm:max-w-[150px] md:h-[60px] md:max-w-none"
                draggable={false}
              />
            </Link>
          </div>

          {/* RIGHT — ICONS (SEARCH / WISHLIST / CART) */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:gap-5 lg:gap-7">
            <button
              type="button"
              aria-label="Search"
              onClick={activateSearch}
              className="flex h-9 w-9 items-center justify-center transition-all duration-300 hover:bg-[#F1E6D5] active:scale-95 md:h-10 md:w-10"
            >
              <Search size={21} strokeWidth={1.8} className="text-[#2F2B27]" />
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => router.push("/wishlist")}
              className="flex h-9 w-9 items-center justify-center transition-all duration-300 hover:bg-[#F1E6D5] active:scale-95 md:h-10 md:w-10"
            >
              <img
                src="/assets/wishlist_icon.png"
                alt="Wishlist"
                className="h-5 w-5 object-contain md:h-7 md:w-7"
                draggable={false}
              />
            </button>

            <button
              type="button"
              aria-label="Cart"
              onClick={() => router.push("/cart")}
              className="flex h-9 w-9 items-center justify-center transition-all duration-300 hover:bg-[#F1E6D5] active:scale-95 md:h-10 md:w-10"
            >
              <ShoppingBag size={21} strokeWidth={1.8} className="text-[#2F2B27]" />
            </button>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* SIDEBAR DRAWER */}
      {/* ================================================= */}

      <div
        className={`fixed inset-0 z-[70] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <button
          type="button"
          aria-label="Close Menu"
          onClick={closeSidebar}
          className={`absolute inset-0 h-full w-full bg-[#2F2B27]/35 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar */}
        <aside
          className={`relative flex h-full w-[min(88vw,360px)] flex-col border-r border-[#E8DCC8] bg-[#F8F2E8] px-5 py-5 shadow-2xl transition-transform duration-300 ease-in-out sm:px-7 sm:py-6 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              onClick={closeSidebar}
              aria-label="Go to home"
            >
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="h-16 w-auto object-contain"
                draggable={false}
              />
            </Link>

            <button
              type="button"
              aria-label="Close Menu"
              onClick={closeSidebar}
              className="rounded-full p-2 text-[#2F2B27] transition hover:scale-105 hover:bg-[#F1E6D5] active:scale-95"
            >
              <X size={22} strokeWidth={1.8} />
            </button>
          </div>

          {/* Sidebar Search Form */}
          <form onSubmit={openSearchFromSidebar} className="mt-6">
            <div className="relative flex flex-col w-full">
              <div className="relative flex items-center w-full border-b border-[#2F2B27]/40 pb-1 focus-within:border-[#2F2B27] transition-colors">
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(event) =>
                    setSidebarSearch(event.target.value)
                  }
                  placeholder="Search collections"
                  className="h-9 w-full bg-transparent pl-0 pr-8 text-base font-medium text-[#2F2B27] placeholder:text-gray-400/80 outline-none border-none focus:outline-none focus:ring-0 shadow-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2F2B27] hover:text-[#C79A2B] transition"
                >
                  <Search size={20} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </form>

          {/* Sidebar Navigation */}
          <nav className="mt-8 space-y-3">
            {sidebarLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className="flex items-center gap-4 border-b border-[#E8DCC8] px-1 py-4 text-[17px] font-medium tracking-[0.04em] text-[#2F2B27] transition hover:text-[#C79A2B]"
              >
                <Icon
                  size={20}
                  strokeWidth={1.7}
                  className="text-[#C79A2B]"
                />

                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}