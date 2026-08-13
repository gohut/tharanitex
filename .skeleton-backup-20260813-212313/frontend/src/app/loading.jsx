"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="home-loading">
      <img
        src="/assets/logo.png"
        alt="Tharani Textiles"
        className="home-loading-logo"
      />
    </div>
  );
}