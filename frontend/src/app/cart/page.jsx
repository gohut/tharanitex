"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const cartItems = [
  {
    id: 1,
    name: "Kanchipuram Silk Saree",
    color: "Royal Maroon",
    price: 5999,
    quantity: 1,
    image: "https://placehold.co/180x240",
  },
  {
    id: 2,
    name: "Soft Silk Saree",
    color: "Emerald Green",
    price: 4299,
    quantity: 2,
    image: "https://placehold.co/180x240",
  },
];

export default function CartPage() {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = 0;
  const discount = 500;
  const total = subtotal + shipping - discount;

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#7A1F3D] to-[#9D2E55] py-14">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <p className="mt-2 text-gray-200">
            Review your selected sarees before checkout.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm p-5 flex flex-col md:flex-row gap-6"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full md:w-40 h-56 object-cover rounded-xl"
              />

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{item.name}</h2>

                <p className="text-gray-500 mt-1">
                  Color: {item.color}
                </p>

                <p className="text-2xl font-bold text-[#8B1E3F] mt-4">
                  ₹{item.price}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-6">
                  <button className="p-2 rounded-lg border hover:bg-gray-100">
                    <Minus size={18} />
                  </button>

                  <span className="text-lg font-medium">
                    {item.quantity}
                  </span>

                  <button className="p-2 rounded-lg border hover:bg-gray-100">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Delete */}
              <button className="self-start text-red-500 hover:text-red-700">
                <Trash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-2xl font-semibold mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>

            <hr />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-[#8B1E3F]">
                ₹{total}
              </span>
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-8">
            <label className="font-medium">
              Coupon Code
            </label>

            <div className="flex mt-3">
              <input
                type="text"
                placeholder="Enter coupon"
                className="flex-1 border rounded-l-xl px-4 py-3 outline-none"
              />

              <button className="bg-[#8B1E3F] text-white px-5 rounded-r-xl hover:bg-[#6F1731]">
                Apply
              </button>
            </div>
          </div>

          <button className="w-full mt-8 bg-[#8B1E3F] text-white py-4 rounded-xl font-semibold hover:bg-[#6F1731] transition">
            Proceed to Checkout
          </button>

          <button className="w-full mt-3 border border-[#8B1E3F] text-[#8B1E3F] py-4 rounded-xl hover:bg-[#8B1E3F] hover:text-white transition">
            Continue Shopping
          </button>
        </div>
      </section>

      {/* Recommended */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-8">
          You May Also Like
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              <img
                src="https://placehold.co/350x450"
                className="w-full h-72 object-cover"
                alt=""
              />

              <div className="p-4">
                <h3 className="font-semibold">
                  Premium Silk Saree
                </h3>

                <p className="text-[#8B1E3F] font-bold mt-2">
                  ₹4,999
                </p>

                <button className="w-full mt-4 bg-[#8B1E3F] text-white py-3 rounded-lg hover:bg-[#6F1731]">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Empty State Example */}
      {false && (
        <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6">
          <ShoppingBag
            size={80}
            className="text-[#8B1E3F]"
          />

          <h2 className="text-4xl font-bold mt-6">
            Your Cart is Empty
          </h2>

          <p className="text-gray-500 mt-3">
            Looks like you haven't added any sarees yet.
          </p>

          <button className="mt-8 bg-[#8B1E3F] text-white px-8 py-4 rounded-xl hover:bg-[#6F1731]">
            Explore Collection
          </button>
        </div>
      )}
    </main>
  );
}