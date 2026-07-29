"use client";

import {
  ChevronDown,
  Truck,
  HeartHandshake,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa6";
import { useState } from "react";

const accordionItems = [
  {
    icon: <Truck size={18} className="text-[#C48B2A]" />,
    title: "Shipping Information",
    content:
      "Free shipping across India. Orders are usually delivered within 3–7 business days.",
  },
  {
    icon: <HeartHandshake size={18} className="text-[#C48B2A]" />,
    title: "Care Guide",
    content:
      "Dry clean only. Store folded in a muslin cloth and avoid direct sunlight.",
  },
  {
    icon: <FaWhatsapp size={18} className="text-[#25D366]" />,
    title: "WhatsApp Enquiry",
    content:
      "Chat with us on WhatsApp for assistance regarding this saree.",
  },
];

export default function ProductAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mt-5 border-t border-[#E8DCCB]">

      {accordionItems.map((item, index) => (
        <div
          key={index}
          className="border-b border-[#E8DCCB]"
        >
          <button
            onClick={() =>
              setOpen(open === index ? -1 : index)
            }
            className="
              w-full
              flex
              justify-between
              items-center
              py-5
            "
          >
            <div className="flex items-center gap-3">

              {item.icon}

              <span className="font-medium text-[#4F4F4F]">
                {item.title}
              </span>

            </div>

            <ChevronDown
              className={`transition-transform ${
                open === index ? "rotate-180" : ""
              }`}
            />
          </button>

          {open === index && (
            <p className="pb-6 text-[#6A6A6A] leading-7">
              {item.content}
            </p>
          )}
        </div>
      ))}

    </div>
  );
}