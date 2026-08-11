import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import ProductCard from "@/components/home/ProductSection/ProductCard";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCategoryBySlug } from "@/lib/db/category";
import { getProductsByCategorySlug } from "@/lib/db/product";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const { env } = await getCloudflareContext({ async: true });

  const category = await getCategoryBySlug(env.DB, slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategorySlug(env.DB, slug);

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-24 md:pt-12 lg:px-12">
        <div className="text-center">
          <Link
            href="/collections"
            className="text-xs uppercase tracking-[0.25em] text-[#9B7A2B] hover:text-[#D4A437]"
          >
            ? All Collections
          </Link>

          <h1 className="mt-4 text-[44px] font-light leading-none text-[#D4A437] sm:text-[58px] md:text-[72px]">
            {category.name}
          </h1>

          {category.description ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#72675A] md:text-base">
              {category.description}
            </p>
          ) : category.subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#72675A] md:text-base">
              {category.subtitle}
            </p>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-9 sm:mt-14 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-7 xl:gap-y-14">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-[#DDCFBD] bg-[#FCF7EF] px-6 py-20 text-center">
            <h2 className="font-klaristha text-3xl text-[#D4A437]">
              No Products Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7D7267]">
              Products from this collection will appear here once they are
              added.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
