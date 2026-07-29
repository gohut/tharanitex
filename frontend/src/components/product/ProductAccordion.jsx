"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const accordionItems = [
  {
    title: "Shipping Information",
    content:
      "Free shipping across India. Orders are usually delivered within 3–7 business days.",
  },
  {
    title: "Care Guide",
    content:
      "Dry clean only. Store folded in a muslin cloth and avoid direct sunlight.",
  },
  {
    title: "Need Help?",
    content:
      "Chat with us on WhatsApp for assistance regarding this saree.",
  },
];

export default function ProductAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mt-6 border-t border-[#E8DCCB]">

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
              py-6
            "
          >
            <span className="font-medium">
              {item.title}
            </span>

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