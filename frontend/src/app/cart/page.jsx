import Navbar from "@/components/home/Navbar/Navbar";
import CartItem from "@/components/Cart/CartItem";
import OrderSummary from "@/components/Cart/OrderSummary";
import DeliveryCard from "@/components/Cart/DeliveryCard";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCart } from "@/lib/db/cart";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function CartPage() {
  const { env } = await getCloudflareContext({ async: true });
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value || "";
  const user = await validateSession(token, env);
  if (!user || user.userType !== "customer") redirect("/login");
  const cartItems = await getCart(env.DB, String(user.userId));

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
        <section
          className="border-b border-[#E8DCCB] bg-[#F4E7D4] bg-cover bg-[center_right] bg-no-repeat"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(248, 242, 232, 0.92) 0%, rgba(248, 242, 232, 0.82) 38%, rgba(248, 242, 232, 0.32) 100%), url('/assets/header1.png')" }}
        >
          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Tharani Textiles
            </p>

            <h1 className="mt-3 text-4xl font-serif text-[#5A1F2F] sm:text-5xl lg:text-6xl">
              My Cart
            </h1>

            <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
              {cartItems.length} Item{cartItems.length !== 1 && "s"} in your shopping bag.
            </p>

          </div>
        </section>

        {/* Breadcrumb */}
        <section className="mx-auto max-w-[1440px] px-5 py-4 text-sm text-gray-500 sm:px-6 sm:py-5 lg:px-10 lg:py-6">
          Home
          <span className="mx-2">/</span>
          Cart
        </section>

        {/* Main Layout */}
        <section className="mx-auto max-w-[1440px] px-5 pb-14 sm:px-6 sm:pb-20 lg:px-10">

          <div className="grid gap-8 lg:grid-cols-[2fr_430px] lg:gap-14">

            {/* Left Side */}
            <div>

              {/* Column Headers */}
              <div className="hidden grid-cols-[140px_1fr_160px_120px_60px] border-b border-[#D8CCB4] pb-5 text-xs uppercase tracking-[0.18em] text-[#8A8175] lg:grid">

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

            <div className="self-start lg:sticky lg:top-8">

              <OrderSummary
                  subtotal={formatPrice(subtotal)}
                  shipping="Free"
                  tax="Included"
                  total={formatPrice(subtotal)}
                  isCartEmpty={cartItems.length === 0}
              />

              <DeliveryCard />

            </div>

          </div>

        </section>

      </main>
    </>
  );
}
