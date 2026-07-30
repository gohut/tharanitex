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
        <div className="mx-auto flex max-w-[1440px] items-center px-5 py-5 md:px-8 lg:px-10">
          <div className="relative mx-auto w-full max-w-[700px]">
            <Search
              size={28}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#33302B]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for sarees"
              className="h-[56px] w-full border border-[#5E5951] bg-white pl-14 pr-12 text-[18px] tracking-[0.08em] text-[#33302B] outline-none focus:border-[#D7A13A]"
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

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-8 md:px-8 lg:px-10">
        <div className="flex items-center justify-end">
          <button className="inline-flex items-center gap-3 text-[18px] font-medium tracking-[0.06em] text-[#2B2721] transition hover:text-[#D39A2F]">
            <SlidersHorizontal size={24} />
            <span>Filter</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
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
