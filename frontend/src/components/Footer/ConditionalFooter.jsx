"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
      return;
    }

    const handleLoad = () => setReady(true);
    window.addEventListener("load", handleLoad, { once: true });

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (!ready) return null;

  return <Footer />;
}
