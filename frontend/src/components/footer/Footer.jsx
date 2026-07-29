"use client";

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
      <div className="max-w-[1420px] mx-auto px-10 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr] gap-16">

          {/* ================= LOGO ================= */}

          <div className="pr-4">

            <img
              src="/assets/logo.png"
              alt="Tharani Textiles"
              className="w-64"
            />

            <p className="mt-8 font-sans text-[15px] leading-8 text-[#F6ECD0]">
              Timeless Craftsmanship
              <br />
              Since 1995
            </p>

          </div>

          {/* ================= SITE LINKS ================= */}

          <div className="relative pl-10">

            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25" />

            <h3 className="font-cormorant text-[24px] text-[#C79A2B] mb-7">
              SITE LINKS
            </h3>

            <ul className="space-y-4 font-sans text-[15px]">

              <li>
                <a
                  href="/"
                  className="hover:text-[#C79A2B] transition-colors"
                >
                  Home
                </a>
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

          <div className="relative pl-10">

            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25" />

            <h3 className="font-cormorant text-[24px] text-[#C79A2B] mb-7">
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
                <span>+91 XXXXX XXXXX</span>
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