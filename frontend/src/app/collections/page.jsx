import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllCategories } from "@/lib/db/category";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const { env } = await getCloudflareContext({ async: true });
  const categories = await getAllCategories(env.DB, { activeOnly: true });

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-24 md:pt-12 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9B7A2B]">
            Tharani Tex
          </p>

          <h1 className="mt-2 text-[44px] font-light leading-none text-[#D4A437] sm:text-[58px] md:text-[72px]">
            Our Collections
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#72675A] md:text-base">
            Explore our carefully curated collections, where traditional
            craftsmanship meets timeless elegance.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden bg-white">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center bg-[#EDE2D1]">
                      <span className="font-klaristha text-2xl text-[#D4A437]">
                        {category.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-2 pb-2 pt-4 text-center">
                  <h2 className="font-cormorant-garamond text-[25px] uppercase tracking-[0.05em] text-[#4A433C] sm:text-[30px]">
                    {category.name}
                  </h2>

                  {category.subtitle && (
                    <p className="mt-1 font-cormorant-garamond text-sm uppercase tracking-[0.08em] text-[#D4A437] sm:text-base">
                      {category.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-[#DDCFBD] px-6 py-20 text-center">
            <h2 className="font-klaristha text-3xl text-[#D4A437]">
              Collections Coming Soon
            </h2>
          </div>
        )}
      </section>
    </main>
  );
}
