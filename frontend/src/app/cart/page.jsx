import Navbar from "@/components/home/Navbar/Navbar";
import CartItem from "@/components/Cart/CartItem";
import OrderSummary from "@/components/Cart/OrderSummary";
import DeliveryCard from "@/components/Cart/DeliveryCard";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCart } from "@/lib/db/cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { env } = await getCloudflareContext({ async: true });
  const cartItems = await getCart(env.DB, "guest");

  const subtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <>
      <Navbar />

      <main className="bg-[#F8F2E8] min-h-screen">

        {/* Header */}
        <section className="bg-white border-b border-[#E8DCCB]">
          <div className="max-w-[1440px] mx-auto px-10 py-12">

            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Tharani Textiles
            </p>

            <h1 className="mt-3 text-6xl font-serif text-[#5A1F2F]">
              My Cart
            </h1>

            <p className="mt-4 text-gray-600">
              {cartItems.length} Item{cartItems.length !== 1 && "s"} in your shopping bag.
            </p>

          </div>
        </section>

        {/* Breadcrumb */}
        <section className="max-w-[1440px] mx-auto px-10 py-6 text-sm text-gray-500">
          Home
          <span className="mx-2">/</span>
          Cart
        </section>

        {/* Main Layout */}
        <section className="max-w-[1440px] mx-auto px-10 pb-20">

          <div className="grid lg:grid-cols-[2fr_430px] gap-14">

            {/* Left Side */}
            <div>

              {/* Column Headers */}
              <div className="grid grid-cols-[140px_1fr_160px_120px_60px] pb-5 border-b border-[#D8CCB4] text-[#8A8175] uppercase tracking-[0.18em] text-xs">

                <div>Product</div>

                <div></div>

                <div className="text-center">
                  Qty
                </div>

                <div className="text-center">
                  Total
                </div>

                <div></div>

              </div>

              {cartItems.map((product) => (
                <CartItem
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

            {/* Right Side */}

            <div className="sticky top-8 self-start">

              <OrderSummary
                  subtotal={formatPrice(subtotal)}
                  shipping="Free"
                  tax="Included"
                  total={formatPrice(subtotal)}
              />

              <DeliveryCard />

            </div>

          </div>

        </section>

      </main>
    </>
  );
}
