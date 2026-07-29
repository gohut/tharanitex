"use client";

import { MapPin, Truck } from "lucide-react";

export default function DeliveryCard() {
  return (
    <div className="mt-6 bg-white border border-[#E8DCCB] rounded-sm p-6 shadow-sm">

      <div className="flex items-center gap-3">
        <MapPin className="text-[#D49E28]" size={22} />
        <h3 className="text-2xl font-serif text-[#5A1F2F]">
          Delivery
        </h3>
      </div>

      <p className="mt-2 text-[#7B7367] text-sm">
        Check if delivery is available at your location.
      </p>

      <div className="mt-6 flex gap-3">

        <input
          type="text"
          placeholder="Enter Pincode"
          className="
            flex-1
            h-12
            px-4
            border
            border-[#D8CCB4]
            rounded-sm
            outline-none
            focus:border-[#D49E28]
            bg-[#FFFDF8]
          "
        />

        <button
          className="
            px-6
            bg-[#5A1F2F]
            text-white
            rounded-sm
            hover:bg-[#471825]
            transition
          "
        >
          Check
        </button>

      </div>

      <div className="mt-6 flex items-center gap-3 text-[#4B4B4B]">

        <Truck
          size={20}
          className="text-[#D49E28]"
        />

        <span>
          Estimated Delivery:
          <span className="font-semibold">
            {" "}2–4 Business Days
          </span>
        </span>

      </div>

    </div>
  );
}