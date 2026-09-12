"use client";

import { useEffect, useState } from "react";

export default function InitialLoadingShell() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
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
        setVisible(false);
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
    }, 700);

    return () => {
      clearTimeout(minimumTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`home-loading transition-opacity duration-350 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/assets/logo.png"
        alt="Tharani Textiles"
        className="home-loading-logo"
      />
    </div>
  );
}