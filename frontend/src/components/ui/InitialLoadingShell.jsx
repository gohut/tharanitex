"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  HomeSkeleton,
  ShopSkeleton,
  SearchSkeleton,
  ProductDetailSkeleton,
  CartSkeleton,
  OrdersSkeleton,
  ProfileSkeleton,
  WishlistSkeleton,
  LoginSkeleton,
  GlobalSkeleton,
} from "./PageSkeleton";

const MIN_LOADING_TIME = 1200;

function getSkeleton(pathname) {
  if (pathname === "/" || pathname === "/home") {
    return <HomeSkeleton />;
  }

  if (pathname === "/products" || pathname.startsWith("/collections")) {
    return <ShopSkeleton />;
  }

  if (pathname === "/search") {
    return <SearchSkeleton />;
  }

  if (pathname.startsWith("/product/")) {
    return <ProductDetailSkeleton />;
  }

  if (pathname === "/cart") {
    return <CartSkeleton />;
  }

  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
    return <OrdersSkeleton />;
  }

  if (pathname === "/profile") {
    return <ProfileSkeleton />;
  }

  if (pathname === "/wishlist") {
    return <WishlistSkeleton />;
  }

  if (pathname === "/login") {
    return <LoginSkeleton />;
  }

  return <GlobalSkeleton />;
}

export default function InitialLoadingShell() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let minimumTimePassed = false;
    let pageLoaded = false;

    const hideLoader = () => {
      if (!minimumTimePassed || !pageLoaded) return;

      setFadeOut(true);

      setTimeout(() => {
        setVisible(false);
      }, 350);
    };

    const minimumTimer = setTimeout(() => {
      minimumTimePassed = true;
      hideLoader();
    }, MIN_LOADING_TIME);

    if (document.readyState === "complete") {
      pageLoaded = true;
      hideLoader();
    } else {
      const handleLoad = () => {
        pageLoaded = true;
        hideLoader();
      };

      window.addEventListener("load", handleLoad, { once: true });

      return () => {
        clearTimeout(minimumTimer);
        window.removeEventListener("load", handleLoad);
      };
    }

    return () => {
      clearTimeout(minimumTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[99999]
        overflow-y-auto
        bg-[#FBF5EA]
        transition-opacity duration-350
        ${fadeOut ? "pointer-events-none opacity-0" : "opacity-100"}
      `}
    >
      {getSkeleton(pathname)}
    </div>
  );
}