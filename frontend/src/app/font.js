import localFont from "next/font/local";
import { Montserrat, Cormorant_Garamond } from "next/font/google";

export const klaristha = localFont({
  src: "../fonts/Klaristha.otf",
  variable: "--font-klaristha",
});

export const modernRomance = localFont({
  src: "../fonts/ModernRomance.otf",
  variable: "--font-modern-romance",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
});