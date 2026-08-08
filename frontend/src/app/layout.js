import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";
import ConditionalFooter from "@/components/Footer/ConditionalFooter";
import localFont from "next/font/local";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { Toaster } from "react-hot-toast";

const montserrat = localFont({
  src: [
    {
      path: "../fonts/Montserrat-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Montserrat-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Montserrat-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Montserrat-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
});

const klaristha = localFont({
  src: "../fonts/Klaristha-Thin.ttf",
  variable: "--font-klaristha",
});

const modernRomance = localFont({
  src: "../fonts/Modern Romance.otf",
  variable: "--font-modern-romance",
});

const cormorant = localFont({
  src: "../fonts/CormorantInfant-Light.otf",
  variable: "--font-cormorant",
});
export const metadata = {
  title: "Tharani Textiles",
  description: "Premium Silk Sarees",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorant.variable} ${klaristha.variable} ${modernRomance.variable}`}
    >
      <body className="font-montserrat">
        <ThemeProvider />
        {children}
        <ScrollToTop />
         <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 2500,
            style: {
              background: "#5A1F2F",
              color: "#fff",
              border: "1px solid #D4A437",
            },
            success: {
              iconTheme: {
                primary: "#D4A437",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <ConditionalFooter />
      </body>
    </html>
  );
}
