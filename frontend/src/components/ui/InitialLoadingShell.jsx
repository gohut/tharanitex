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

const LOGO_SCREEN_TIME = 1400;
const SKELETON_MIN_TIME = 500;

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

  const [stage, setStage] = useState("logo");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStage("logo");
      setFadeOut(false);
    }, 0);

    const logoTimer = setTimeout(() => {
      setStage("skeleton");
    }, LOGO_SCREEN_TIME);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(logoTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (stage !== "skeleton") return;

    let minimumTimePassed = false;
    let pageLoaded = document.readyState === "complete";
    let finished = false;

    const finishLoading = () => {
      if (finished || !minimumTimePassed || !pageLoaded) {
        return;
      }

      finished = true;
      setFadeOut(true);

      setTimeout(() => {
        setStage("done");
      }, 350);
    };

    const handleLoad = () => {
      pageLoaded = true;
      finishLoading();
    };

    if (!pageLoaded) {
      window.addEventListener("load", handleLoad, { once: true });
    }

    const minimumTimer = setTimeout(() => {
      minimumTimePassed = true;
      pageLoaded = document.readyState === "complete";
      finishLoading();
    }, SKELETON_MIN_TIME);

    return () => {
      clearTimeout(minimumTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, [stage]);

  if (stage === "done") return null;

  if (stage === "logo") {
    return (
      <div
        className="
          fixed inset-0 z-[99999]
          flex items-center justify-center
          bg-[#FBF5EA]
        "
      >
        <img
          src="/assets/logo.png"
          alt="Tharani Textiles"
          className="
            w-[220px]
            max-w-[65vw]
            object-contain
            animate-pulse
          "
        />
      </div>
    );
  }

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