import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";

import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getProductBySlug } from "@/lib/db/product";
import { ReviewRepository } from "@/repositories/ReviewRepository";

import { productData } from "@/data/productData";

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const { env } = await getCloudflareContext({
    async: true,
  });

  const product = await getProductBySlug(env.DB, slug);

  if (!product) {
    notFound();
  }

  /*
   * REAL REVIEWS
   *
   * Reviews are loaded directly from D1.
   * ReviewRepository only returns approved reviews.
   */
  const dbReviews = await ReviewRepository.findByProductId(
  product.id,
  env.DB
);

  const reviews = (dbReviews || []).map((review) => ({
    id: review.id,
    name: review.reviewer_name || "Verified Customer",
    rating: Number(review.rating) || 0,
    comment: review.comment || "",
    date: review.created_at
      ? new Date(review.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
  }));

  return (
    <>
      <Navbar />

      <main className="bg-[#FBF5EA]">

        {/* PRODUCT */}
        <section
          className="
            mx-auto
            w-full
            max-w-[430px]
            px-4
            pb-8
            pt-4

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

            <div className="w-full">
              <ProductDetails product={product} />
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <RelatedProducts
          products={productData.relatedProducts}
        />

        {/* REAL D1 REVIEWS */}
        <ReviewSection
          product={product}
          reviews={reviews}
        />

      </main>
    </>
  );
}