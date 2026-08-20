"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load products");
        return response.json();
      })
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const searchable = (product) =>
      [product.name, product.category, product.description].filter(Boolean).join(" ").toLowerCase();

    let filtered = products.filter(
      (product) => product.slug && (!term || searchable(product).includes(term))
    );

    if (selectedCategories.length)
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    if (inStockOnly) filtered = filtered.filter((product) => Number(product.stock) > 0);

    if (sort === "price-low") filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-high") filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));

    return filtered;
  }, [products, query, selectedCategories, inStockOnly, sort]);

  const toggleCategory = (category) =>
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );

  const clearFilters = () => {
    setSelectedCategories([]);
    setInStockOnly(false);
    setSort("featured");
  };

  const filterCount = selectedCategories.length + (inStockOnly ? 1 : 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-7 md:px-8 lg:px-10">
        <div className="flex items-center justify-between border-b border-[#D8CCB4] pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7A65]">SEARCH RESULTS</p>
            <h1 className="mt-0.5 truncate font-klaristha text-2xl text-[#D39A2F] sm:text-3xl lg:text-4xl">
              {query ? `“${query}”` : "All Sarees"}
            </h1>
            <p className="mt-1 text-xs text-[#6F6458] sm:text-sm">
              {loading ? "Loading products…" : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
            </p>
          </div>

          {/* Filter & Sort icon controls straight to the search results heading */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Icon Only */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Filter products"
              title="Filter products"
              className="relative flex h-10 w-10 items-center justify-center text-[#2B2721] hover:text-[#C79A2B] transition active:scale-95"
            >
              <SlidersHorizontal size={21} strokeWidth={1.8} />
              {filterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C79A2B] text-[10px] font-bold text-white">
                  {filterCount}
                </span>
              )}
            </button>

            {/* Sort Icon Only */}
            <div
              className="relative flex h-10 w-10 items-center justify-center text-[#2B2721] hover:text-[#C79A2B] transition cursor-pointer"
              title="Sort products"
            >
              <ArrowUpDown size={21} strokeWidth={1.8} />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
                className="absolute inset-0 cursor-pointer h-full w-full opacity-0"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {!loading && results.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 xl:gap-y-12">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !results.length && (
          <div className="mt-6 border border-[#DDCFBD] bg-[#FCF7EF] px-5 py-14 text-center sm:px-6 sm:py-16">
            <p className="font-klaristha text-[28px] uppercase text-[#D39A2F] sm:text-[36px]">No Products Found</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#7D7267] sm:mt-4">
              Try another keyword or clear your filters to explore the collection.
            </p>
          </div>
        )}
      </section>

      {/* Filter Modal Drawer */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-[#2F2B27]/40 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Filter search results"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative flex max-h-[88dvh] w-full flex-col bg-[#FFFDF9] shadow-2xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-[#E8DCC8] px-5 py-4">
              <h2 className="text-lg font-medium text-[#2B2721]">Filter products</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-11 w-11 items-center justify-center hover:bg-[#F8F2E8]"
              >
                <X size={22} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#8A7A65]">Category</p>
              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex min-h-11 items-center gap-3 border-b border-[#EEE4D5] px-2 text-sm text-[#2B2721] last:border-b-0 hover:bg-[#F8F2E8]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-5 w-5 accent-[#C79A2B]"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.13em] text-[#8A7A65]">Availability</p>
              <label className="mt-3 flex min-h-11 items-center gap-3 border-b border-[#EEE4D5] px-2 text-sm text-[#2B2721]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => setInStockOnly(event.target.checked)}
                  className="h-5 w-5 accent-[#C79A2B]"
                />
                <span>In stock</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#E8DCC8] p-4">
              <button
                type="button"
                onClick={clearFilters}
                className="h-12 border border-[#BDA985] text-sm font-medium text-[#2B2721]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="h-12 bg-[#2F2B27] text-sm font-medium text-white"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
