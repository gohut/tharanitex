"use client";

import { useState } from "react";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";

const initialWishlist = [
  {
    id: 1,
    name: "Kanchipuram Silk Saree",
    category: "Pure Silk",
    price: "₹5,999",
    image: "/assets/sarees/kanchipuram.png",
  },
  {
    id: 2,
    name: "Banarasi Silk Saree",
    category: "Banarasi",
    price: "₹7,499",
    image: "/assets/sarees/banaras1.png",
  },
  {
    id: 3,
    name: "Banaras Bridal Saree",
    category: "Wedding",
    price: "₹8,999",
    image: "/assets/sarees/banaras2.png",
  },
  {
    id: 4,
    name: "Thirubuvanam Silk",
    category: "Traditional",
    price: "₹6,299",
    image: "/assets/sarees/thirubuvanam.png",
  },
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (product) => {
    alert(`${product.name} added to bag.`);
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#F8F2E8] min-h-screen">

        {/* Heading */}
        <section className="bg-white border-b border-[#E8DCCB]">
          <div className="max-w-7xl mx-auto px-6 py-12">

            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Tharani Textiles
            </p>

            <h1 className="mt-3 text-5xl lg:text-6xl font-serif text-[#5A1F2F]">
              My Wishlist
            </h1>

            <p className="mt-5 text-gray-600 max-w-2xl leading-7">
              Your curated collection of timeless silk sarees.
            </p>

            <p className="mt-6 text-[#8A8175] text-lg">
              {wishlistItems.length} Saved Item{wishlistItems.length !== 1 && "s"}
            </p>

          </div>
        </section>

        {/* Breadcrumb */}
        <section className="max-w-7xl mx-auto px-6 py-5 text-sm text-gray-500">
          Home
          <span className="mx-2">/</span>
          Wishlist
        </section>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <section className="max-w-7xl mx-auto px-6 py-28 text-center">

            <img
              src="/assets/wishlist.png"
              alt="Wishlist"
              className="w-20 mx-auto opacity-70"
            />

            <h2 className="mt-6 text-4xl text-[#5A1F2F] font-serif">
              Your Wishlist is Empty
            </h2>

            <p className="mt-4 text-gray-600">
              Discover our premium silk collections and save your favourites.
            </p>

            <button className="mt-8 px-8 py-3 rounded-full bg-[#5A1F2F] text-white hover:bg-[#471825] transition">
              Continue Shopping
            </button>

          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-6 pb-20">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist
                  onRemove={() => removeFromWishlist(product.id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}

            </div>

          </section>
        )}

      </main>
    </>
  );
}