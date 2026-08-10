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
    <footer className="bg-[#00361F] text-[#F6ECD0]">
      {/* Top Border */}
      <img
        src="/assets/footer-top.png"
        alt=""
        className="block w-full select-none"
      />

      {/* ================= MOBILE / TABLET LAYOUT (< lg) ================= */}
      <div className="lg:hidden mx-auto max-w-[1420px] px-5 py-10 sm:px-10">
        <div className="flex items-start justify-between gap-2">
          {/* Logo */}
          <div className="flex-1 text-center">
            <img
              src="/assets/logo.png"
              alt="Tharani Textiles"
              className="mx-auto w-20 sm:w-28"
            />
            <p className="mt-3 font-sans text-[10px] leading-[1.6] text-[#F6ECD0] sm:text-[12px]">
              Timeless Craftsmanship
              <br />
              since 1995
            </p>
          </div>

          <div className="mt-1 h-24 w-px shrink-0 bg-[#C79A2B]/25 sm:h-28" />

          {/* Site Links */}
          <div className="flex-1">
            <h3 className="font-cormorant text-[15px] text-[#C79A2B] mb-3 sm:text-[18px]">
              SITE LINKS
            </h3>
            <ul className="space-y-2 font-sans text-[11px] sm:text-[13px]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/cart"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Your Cart
                </a>
              </li>
              <li>
                <a
                  href="/wishlist"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Wishlist
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Your Account
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-1 h-24 w-px shrink-0 bg-[#C79A2B]/25 sm:h-28" />

          {/* Customer Care */}
          <div className="flex-1">
            <h3 className="font-cormorant text-[15px] text-[#C79A2B] mb-3 sm:text-[18px]">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2 font-sans text-[11px] sm:text-[13px]">
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Return & Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact rows — no heading, matches reference layout */}
        <div className="mt-10 space-y-4 font-sans text-[11px] sm:text-[13px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#C79A2B]" />
              <span>Elampillai, Tamil Nadu</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-[#C79A2B]" />
              <span>info@tharanitextiles.com</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-[#C79A2B]" />
              <span>+91 79040 70963</span>
            </div>
            <div className="flex gap-5 text-[18px] text-[#C79A2B]">
              <a
                href="#"
                className="transition hover:scale-110 hover:text-white"
              >
                <FaYoutube />
              </a>
              <a
                href="#"
                className="transition hover:scale-110 hover:text-white"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="transition hover:scale-110 hover:text-white"
              >
                <FaXTwitter />
              </a>
              <a
                href="#"
                className="transition hover:scale-110 hover:text-white"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (lg+) — unchanged ================= */}
      <div className="hidden lg:block mx-auto max-w-[1420px] px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid grid-cols-[1.25fr_1fr_1fr_1.15fr] gap-16">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-64 text-center">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="w-full"
              />
              <p className="mt-8 text-center font-sans text-[15px] leading-8 text-[#F6ECD0]">
                Timeless Craftsmanship
                <br />
                Since 1995
              </p>
            </div>
          </div>

          {/* Site Links */}
          <div className="relative pl-10">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25" />
            <h3 className="font-cormorant text-[24px] text-[#C79A2B] mb-7">
              SITE LINKS
            </h3>
            <ul className="space-y-4 font-sans text-[15px]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/cart"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Your Cart
                </a>
              </li>
              <li>
                <a
                  href="/wishlist"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Wishlist
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Your Account
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="relative pl-10">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25" />
            <h3 className="font-cormorant text-[24px] text-[#C79A2B] mb-7">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-4 font-sans text-[15px]">
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C79A2B] transition-colors">
                  Return & Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="relative pl-10">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25" />
            <h3 className="font-cormorant text-[24px] text-[#C79A2B] mb-7">
              CONTACT
            </h3>
            <div className="space-y-5 font-sans text-[15px] text-[#F6ECD0]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-[#C79A2B]" />
                <span>
                  Elampillai,
                  <br />
                  Tamil Nadu
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[#C79A2B]" />
                <span>+91 79040 70963</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[#C79A2B]" />
                <span>info@tharanitextiles.com</span>
              </div>
              <div className="flex gap-6 pt-5 text-[22px] text-[#C79A2B]">
                <a
                  href="#"
                  className="transition hover:scale-110 hover:text-white"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="transition hover:scale-110 hover:text-white"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="transition hover:scale-110 hover:text-white"
                >
                  <FaXTwitter />
                </a>
                <a
                  href="#"
                  className="transition hover:scale-110 hover:text-white"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border */}
      <img
        src="/assets/footer-bottom.png"
        alt=""
        className="block w-full select-none"
      />
    </footer>
  );
}
