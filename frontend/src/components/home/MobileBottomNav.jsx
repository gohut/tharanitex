"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingBag, ShoppingCart } from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    match: (pathname) => pathname === "/" || pathname === "/home",
  },
  {
    label: "My Orders",
    href: "/orders",
    icon: ShoppingBag,
    match: (pathname) => pathname.startsWith("/orders"),
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingCart,
    match: (pathname) => pathname.startsWith("/cart"),
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    match: (pathname) => pathname.startsWith("/wishlist"),
  },
];

const hiddenPrefixes = ["/admin", "/login"];

export default function MobileBottomNav() {
  const pathname = usePathname();

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden="true" />
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8DCC8] bg-[#F8F2E8]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname);

            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  active
                    ? "bg-[#EFE4D2] text-[#B88718]"
                    : "text-[#5D544A] hover:bg-[#F1E6D5]"
                }`}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
