import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWishlist } from "@/lib/db/wishlist";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  let userId = null;

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value || "";
  if (sessionToken) {
    const user = await validateSession(sessionToken, env);
    if (user?.userType === "customer" && user.userId) userId = String(user.userId);
  }

  const wishlistItems = userId ? await getWishlist(env.DB, userId) : [];

  return (
    <>
      <Navbar />

      <main className="bg-[#F8F2E8] min-h-screen">
        {/* Heading */}
        <section
          className="border-b border-[#E8DCCB] bg-[#F4E7D4] bg-cover bg-[center_right] bg-no-repeat"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(248, 242, 232, 0.92) 0%, rgba(248, 242, 232, 0.82) 38%, rgba(248, 242, 232, 0.32) 100%), url('/assets/header2.png')" }}
        >
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12">
            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Tharani Textiles
            </p>

            <h1 className="mt-3 text-4xl font-serif text-[#5A1F2F] sm:text-5xl lg:text-6xl">
              My Wishlist
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:mt-5 sm:text-base sm:leading-7">
              Your curated collection of timeless silk sarees.
            </p>

            <p className="mt-5 text-base text-[#8A8175] sm:mt-6 sm:text-lg">
              {wishlistItems.length} Saved Item
              {wishlistItems.length !== 1 && "s"}
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="mx-auto max-w-7xl px-5 py-4 text-sm text-gray-500 sm:px-6 sm:py-5">
          <Link href="/" className="hover:text-[#5A1F2F]">
            Home
          </Link>
          <span className="mx-2">/</span>
          Wishlist
        </section>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 sm:py-28">
            <img
              src="/assets/wishlist_icon.png"
              alt="Wishlist"
              className="w-20 mx-auto opacity-70"
            />

            <h2 className="mt-6 text-3xl font-serif text-[#5A1F2F] sm:text-4xl">
              Your Wishlist is Empty
            </h2>

            <p className="mt-4 text-gray-600">
              Discover our premium silk collections and save your favourites.
            </p>

            <Link
              href="/"
              className="inline-block mt-8 px-8 py-3 rounded-full bg-[#5A1F2F] text-white hover:bg-[#471825] transition"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 sm:pb-20">
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={{
                    ...product,
                    id: product.product_id,
                  }}
                  initiallyWishlisted={true}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
