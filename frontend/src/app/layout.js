import { Inter } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Tharani Textiles Admin — E-Commerce Dashboard",
  description: "Admin dashboard for Tharani Textiles ethnic wear e-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
