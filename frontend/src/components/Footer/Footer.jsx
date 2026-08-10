"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#004831] text-[#D4A437]">

      {/* =====================================================
          MOBILE FOOTER
      ===================================================== */}
      <div className="md:hidden">

        {/* Top Decorative Border */}
        <div className="w-full overflow-hidden">
          <img
            src="/assets/footer-top.png"
            alt=""
            className="block h-auto w-full"
            draggable={false}
          />
        </div>

        {/* Main Mobile Content */}
        <div className="px-5 py-8">

          {/* 3 Column Section */}
          <div className="grid grid-cols-[1fr_1fr_1.15fr]">

            {/* Logo */}
            <div className="flex flex-col items-center justify-start px-2 text-center">
              <Link href="/home" aria-label="Go to home">
                <img
                  src="/assets/logo.png"
                  alt="Tharani Textiles"
                  className="h-auto w-[75px] object-contain"
                  draggable={false}
                />
              </Link>

              <p className="mt-3 text-[8px] leading-[1.45] text-[#F3E8C8]">
                Timeless Craftsmanship
                <br />
                since 1995
              </p>
            </div>

            {/* Site Links */}
            <div className="border-l border-[#D4A437] px-3 text-center">
              <h3 className="font-klaristha text-[13px] text-[#D4A437]">
                SITE LINKS
              </h3>

              <div className="mx-auto mt-2 h-px w-[65px] bg-[#D4A437]" />

              <nav className="mt-3 space-y-2">
                <Link
                  href="/home"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Home
                </Link>

                <Link
                  href="/cart"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Your Cart
                </Link>

                <Link
                  href="/wishlist"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Wishlist
                </Link>

                <Link
                  href="/profile"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Your Account
                </Link>
              </nav>
            </div>

            {/* Customer Care */}
            <div className="border-l border-[#D4A437] px-3 text-center">
              <h3 className="font-klaristha text-[13px] text-[#D4A437]">
                CUSTOMER CARE
              </h3>

              <div className="mx-auto mt-2 h-px w-[65px] bg-[#D4A437]" />

              <nav className="mt-3 space-y-2">
                <Link
                  href="/terms"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Terms & Conditions
                </Link>

                <Link
                  href="/privacy"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Privacy Policy
                </Link>

                <Link
                  href="/shipping"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/returns"
                  className="block text-[9px] text-[#F3E8C8]"
                >
                  Return & Refund Policy
                </Link>
              </nav>
            </div>

          </div>

          {/* Divider */}
          <div className="my-7 h-px w-full bg-[#D4A437]/40" />

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-5">

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin
                size={14}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#D4A437]"
              />

              <p className="text-[9px] leading-[1.5] text-[#F3E8C8]">
                Elampillai,
                <br />
                Salem, Tamil Nadu
              </p>
            </div>

            {/* Email */}
            <a
              href="mailto:info@tharanitextiles.com"
              className="flex items-start gap-2"
            >
              <Mail
                size={14}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#D4A437]"
              />

              <span className="break-all text-[9px] leading-[1.5] text-[#F3E8C8]">
                info@tharanitextiles.com
              </span>
            </a>

            {/* Phone */}
            <a
              href="tel:+917904070963"
              className="flex items-center gap-2"
            >
              <Phone
                size={14}
                strokeWidth={1.8}
                className="shrink-0 text-[#D4A437]"
              />

              <span className="text-[9px] text-[#F3E8C8]">
                +91 79040 70963
              </span>
            </a>

            {/* Social Icons */}
            <div className="flex items-center justify-end gap-4 pr-2 text-[#D4A437]">
              <a href="#" aria-label="Instagram">
                <FaInstagram size={13} />
              </a>

              <a href="#" aria-label="Facebook">
                <FaFacebookF size={13} />
              </a>

              <a href="#" aria-label="X">
                <FaXTwitter size={13} />
              </a>

              <a href="#" aria-label="YouTube">
                <FaYoutube size={14} />
              </a>
            </div>

          </div>
        </div>

        {/* Bottom Decorative Border */}
        <div className="w-full overflow-hidden">
          <img
            src="/assets/footer-bottom.png"
            alt=""
            className="block h-auto w-full"
            draggable={false}
          />
        </div>

      </div>


      {/* =====================================================
          DESKTOP FOOTER
          Keep your existing desktop footer here
      ===================================================== */}
      <div className="hidden md:block">

        {/* PUT YOUR CURRENT DESKTOP FOOTER CONTENT HERE */}

      </div>

    </footer>
  );
}