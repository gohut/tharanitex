"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Loading() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="home-loading">
      <Image
        src="/assets/logo.png"
        alt="Tharani Textiles"
        width={360}
        height={120}
        priority
        className="home-loading-logo"
      />
    </div>
  );
}