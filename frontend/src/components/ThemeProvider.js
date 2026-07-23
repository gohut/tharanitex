"use client";

import { useEffect } from "react";
import { applyBrandingTheme, getSavedBrandingTheme } from "../lib/theme";

export default function ThemeProvider() {
  useEffect(() => {
    applyBrandingTheme(getSavedBrandingTheme());
  }, []);

  return null;
}
