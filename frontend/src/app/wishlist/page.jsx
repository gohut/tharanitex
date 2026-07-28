const wishlistItems = [
  {
    id: 1,
    name: "Kanchipuram Silk Saree",
    price: 5999,
    image: "https://placehold.co/500x650",
  },
  {
    id: 2,
    name: "Banarasi Silk Saree",
    price: 7499,
    image: "https://placehold.co/500x650",
  },
  {
    id: 3,
    name: "Soft Silk Saree",
    price: 4299,
    image: "https://placehold.co/500x650",
  },
];

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#7A1F3D] to-[#9D2E55] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold">My Wishlist</h1>
          <p className="mt-3 text-gray-200">
            Save your favorite sarees for later.
          </p>
        </div>
      </section>

      {/* Wishlist Grid */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl bg-white shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[420px] w-full object-cover"
                />

                <button className="absolute right-4 top-4 rounded-full bg-white p-3 shadow transition hover:scale-110">
                  ❤️
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold">{item.name}</h2>

                <p className="mt-3 text-2xl font-bold text-[#8B1E3F]">
                  ₹{item.price}
                </p>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 rounded-xl bg-[#8B1E3F] py-3 text-white transition hover:bg-[#6F1731]">
                    Move to Cart
                  </button>

                  <button className="rounded-xl border border-gray-300 px-5 transition hover:bg-gray-100">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (Show only when wishlist is empty) */}
        {wishlistItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl">❤️</div>
            <h2 className="mt-6 text-3xl font-semibold">
              Your Wishlist is Empty
            </h2>
            <p className="mt-3 text-gray-600">
              Browse our premium silk collections and save your favorites.
            </p>

            <button className="mt-8 rounded-xl bg-[#8B1E3F] px-8 py-3 text-white transition hover:bg-[#6F1731]">
              Explore Collection
            </button>
          </div>
        )}
      </section>
    </main>
  );
}