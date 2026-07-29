"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-6">

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">

        <Image
          src={images[selected]}
          alt="Product"
          fill
          priority
          className="object-cover transition-transform duration-500 hover:scale-[1.02]"
        />

      </div>

      <div className="flex gap-4">

        {images.map((image, index) => (

          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative h-24 w-20 overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
              selected === index
                ? "border-[#C89A35] shadow-md"
                : "border-[#E5D8C7] hover:border-[#C89A35]"
            }`}
          >

            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />

          </button>

        ))}

      </div>

    </div>
  );
}