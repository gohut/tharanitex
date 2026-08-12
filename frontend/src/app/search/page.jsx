"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";
import { searchProducts } from "@/data/customerOrders";

const priceValue = (price) => Number(String(price).replace(/[^0-9.]/g, "")) || 0;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sort, setSort] = useState("featured");
  const categories = useMemo(
    () => [...new Set(searchProducts.map((product) => product.category))],
    []
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    let filtered = searchProducts.filter((product) =>
      !term || `${product.name} ${product.category}`.toLowerCase().includes(term)
    );
    if (selectedCategories.length) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }
    if (sort === "price-low") return [...filtered].sort((a, b) => priceValue(a.price) - priceValue(b.price));
    if (sort === "price-high") return [...filtered].sort((a, b) => priceValue(b.price) - priceValue(a.price));
    return filtered;
  }, [query, selectedCategories, sort]);

  const toggleCategory = (category) => {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  };
  const clearFilters = () => { setSelectedCategories([]); setSort("featured"); };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-7 md:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-[#D8CCB4] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8A7A65]">Search results</p>
            <h1 className="mt-1 truncate font-klaristha text-[28px] leading-tight text-[#D39A2F] sm:text-[36px]">
              {query ? `“${query}”` : "All Sarees"}
            </h1>
            <p className="mt-2 text-sm text-[#6F6458]">{results.length} {results.length === 1 ? "product" : "products"} found</p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
            <button type="button" onClick={() => setIsFilterOpen(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-[#BDA985] bg-[#FFFDF9] px-4 text-sm font-medium text-[#2B2721] sm:flex-none sm:min-w-28">
              <SlidersHorizontal size={19} /><span>Filter</span>{selectedCategories.length > 0 && <span className="bg-[#D39A2F] px-1.5 text-xs text-white">{selectedCategories.length}</span>}
            </button>
            <label className="flex h-11 min-w-0 flex-1 items-center border border-[#BDA985] bg-[#FFFDF9] px-3 sm:w-44 sm:flex-none">
              <span className="mr-2 text-xs text-[#6F6458]">Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#2B2721] outline-none">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 xl:gap-y-12">
          {results.map((product) => (
            <ProductCard key={product.id} product={{ ...product, slug: product.slug || `product-${product.id}` }} />
          ))}
        </div>

        {!results.length && (
          <div className="mt-6 border border-[#DDCFBD] bg-[#FCF7EF] px-5 py-14 text-center sm:px-6 sm:py-16">
            <p className="font-klaristha text-[28px] uppercase text-[#D39A2F] sm:text-[36px]">No Products Found</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#7D7267] sm:mt-4">Try a different keyword or clear your filters to explore more Tharani collections.</p>
          </div>
        )}
      </section>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-[#2F2B27]/40 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label="Filter search results">
          <button type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)} className="absolute inset-0" />
          <div className="relative flex max-h-[88dvh] w-full flex-col bg-[#FFFDF9] shadow-2xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-[#E8DCC8] px-5 py-4">
              <h2 className="text-lg font-medium text-[#2B2721]">Filter products</h2>
              <button type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)} className="flex h-11 w-11 items-center justify-center hover:bg-[#F8F2E8]"><X size={22} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#8A7A65]">Category</p>
              <div className="mt-3 space-y-2">
                {categories.map((category) => <label key={category} className="flex min-h-11 items-center gap-3 border-b border-[#EEE4D5] px-2 text-sm text-[#2B2721] last:border-b-0 hover:bg-[#F8F2E8]"><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} className="h-5 w-5 accent-[#C79A2B]" /><span>{category}</span></label>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#E8DCC8] p-4">
              <button type="button" onClick={clearFilters} className="h-12 border border-[#BDA985] text-sm font-medium text-[#2B2721]">Reset</button>
              <button type="button" onClick={() => setIsFilterOpen(false)} className="h-12 bg-[#2F2B27] text-sm font-medium text-white">Apply filters</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
