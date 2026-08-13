import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProductBySlug } from "@/lib/db/product";

import { productData } from "@/data/productData";

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const product = await getProductBySlug(env.DB, slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#FBF5EA]">
        <section
          className="
            mx-auto
            w-full
            max-w-[430px]
            px-0
            pb-0
            pt-0
            sm:px-5
            sm:pb-14
            sm:pt-5
            md:px-8
            lg:max-w-[1420px]
            lg:px-10
            lg:pt-6
          "
        >
          <div
            className="
              grid
              gap-7
              sm:gap-8
              lg:grid-cols-[minmax(0,720px)_minmax(320px,1fr)]
              lg:gap-10
              xl:gap-14
            "
          >
            <ProductGallery images={product.images} />

            <ProductDetails product={product} />
          </div>
        </section>

        <RelatedProducts products={productData.relatedProducts} />

        <ReviewSection reviews={productData.reviews} />
      </main>
    </>
  );
}