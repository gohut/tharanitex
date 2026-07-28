import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductSection({
  title,
  products,
}) {

  return (

    <section className="bg-[#FBF5EA] py-20">

      <div className="max-w-[1440px] mx-auto px-10">

        <h2 className="text-center text-[54px] font-light text-[#D4A437]">
          {title}
        </h2>

        <div className="relative overflow-visible mt-14">

          {/* Left Arrow */}

          <button
            className="
              absolute
              left-[-28px]
              top-[42%]
              -translate-y-1/2
              z-50
              w-12
              h-12
              rounded-full
              bg-white
              shadow-lg
              flex
              items-center
              justify-center
              hover:scale-105
              transition
            "
          >
            <ArrowLeft
              size={20}
              color="#D69E2E"
            />
          </button>

          {/* Right Arrow */}

          <button
            className="
              absolute
              right-[-28px]
              top-[42%]
              -translate-y-1/2
              z-50
              w-12
              h-12
              rounded-full
              bg-white
              shadow-lg
              flex
              items-center
              justify-center
              hover:scale-105
              transition
            "
          >
            <ArrowRight
              size={20}
              color="#D69E2E"
            />
          </button>

          {/* Products */}

          <div className="grid grid-cols-4 gap-8">

            {products.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}

          </div>

        </div>

        {/* Divider */}

        <div className="flex items-center mt-16">

          <div className="flex-1 border-t border-[#D8CCB4]" />

          <span className="mx-8 text-[#8A8175] text-[18px]">
            Explore More
          </span>

          <div className="flex-1 border-t border-[#D8CCB4]" />

        </div>

      </div>

    </section>

  );

}