import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllProducts } from "@/lib/db/product";
import { getAllCategories } from "@/lib/db/category";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { env } = await getCloudflareContext({ async: true });

  const [products, categories] = await Promise.all([
    getAllProducts(env.DB),
    getAllCategories(env.DB, { activeOnly: true }),
  ]);

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-24 md:pt-12 lg:px-12">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9B7A2B]">
            Tharani Tex
          </p>

          <h1 className="mt-2 text-[44px] font-light leading-none text-[#D4A437] sm:text-[58px] md:text-[72px]">
            All Products
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#72675A] md:text-base">
            Discover the complete Tharani Tex collection, crafted for every
            occasion.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#9B7A2B]">
              Browse:
            </span>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="border border-[#D8CCB4] bg-white px-4 py-2 text-xs uppercase tracking-[0.08em] text-[#4A433C] transition hover:border-[#D4A437] hover:text-[#D4A437]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-9 sm:mt-14 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-7 xl:gap-y-14">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isHomepageCard={false}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-[#DDCFBD] bg-[#FCF7EF] px-6 py-20 text-center">
            <h2 className="font-klaristha text-3xl text-[#D4A437]">
              No Products Available
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7D7267]">
              Products will appear here once they are added from the admin
              panel.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
