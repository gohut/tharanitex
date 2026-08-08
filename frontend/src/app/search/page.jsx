"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";
import { searchProducts } from "@/data/customerOrders";

export default function SearchPage() {
  const [query, setQuery] = useState("Silk Saree");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return searchProducts;
    }

    return searchProducts.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="border-b border-[#D8CCB4]">
        <div className="mx-auto flex max-w-[1440px] items-center px-4 py-4 md:px-8 md:py-5 lg:px-10">
          <div className="relative mx-auto w-full max-w-[700px]">
            <Search
              size={28}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#33302B]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for sarees"
              className="h-[52px] w-full border border-[#5E5951] bg-white pl-12 pr-11 text-base tracking-[0.04em] text-[#33302B] outline-none focus:border-[#D7A13A] sm:h-[56px] sm:pl-14 sm:pr-12 sm:text-[18px] sm:tracking-[0.08em]"
            />
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#33302B] transition hover:text-[#D7A13A]"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-14 pt-6 md:px-8 md:pb-20 md:pt-8 lg:px-10">
        <div className="flex items-center justify-end">
          <button className="inline-flex min-h-11 items-center gap-2 px-2 text-base font-medium tracking-[0.04em] text-[#2B2721] transition hover:text-[#D39A2F] sm:gap-3 sm:text-[18px] sm:tracking-[0.06em]">
            <SlidersHorizontal size={24} />
            <span>Filter</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-12">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {results.length === 0 && (
          <div className="border border-[#DDCFBD] bg-[#FCF7EF] px-6 py-16 text-center">
            <p className="font-klaristha text-[36px] uppercase text-[#D39A2F]">
              No Products Found
            </p>
            <p className="mt-4 text-[#7D7267]">
              Try a different keyword to explore more Tharani collections.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
