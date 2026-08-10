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
      {/* Content */}
      <div className="mx-auto max-w-[1420px] px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-12 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr] lg:gap-16">
            <div className="col-span-2 flex justify-center lg:col-span-1">
            <div className="w-44 text-center sm:w-64">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="w-full"
              />
              <p className="mt-6 text-center font-sans text-[15px] leading-8 text-[#F6ECD0] sm:mt-8">
                Timeless Craftsmanship
                <br />
                Since 1995
              </p>
            </div>
          </div>
          {/* ================= SITE LINKS ================= */}
          <div className="relative lg:pl-10">
            <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-[#C79A2B]/25 lg:block" />
            <h3 className="font-cormorant text-[20px] text-[#C79A2B] mb-5 sm:text-[24px] sm:mb-7">
                SITE LINKS
            </h3>
            <ul className="space-y-3 font-sans text-[13px] sm:space-y-4 sm:text-[15px]">
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
          {/* ================= CUSTOMER CARE ================= */}
          <div className="relative border-l border-[#C79A2B]/25 pl-5 lg:border-l-0 lg:pl-10">
            <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-[#C79A2B]/25 lg:block" />
            <h3 className="font-cormorant text-[20px] text-[#C79A2B] mb-5 sm:text-[24px] sm:mb-7">
                CUSTOMER CARE
            </h3>
            <ul className="space-y-3 font-sans text-[13px] sm:space-y-4 sm:text-[15px]">
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
          <div className="col-span-2 relative border-t border-[#C79A2B]/25 pt-8 lg:col-span-1 lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-[#C79A2B]/25 lg:block" />
            <h3 className="font-cormorant text-[20px] text-[#C79A2B] mb-5 sm:text-[24px] sm:mb-7">
                CONTACT
            </h3>
            <div className="space-y-5 font-sans text-[15px] text-[#F6ECD0]">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-[#C79A2B]"
                />
                <span>
                  Elampillai,
                  <br />
                  Tamil Nadu
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="shrink-0 text-[#C79A2B]"
                />
                <span>+91 79040 70963</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="shrink-0 text-[#C79A2B]"
                />
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
