import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";

import { ReviewService } from "@/services/ReviewService";

import { notFound } from "next/navigation";

import {
  getCloudflareContext,
} from "@opennextjs/cloudflare";

import {
  getProductBySlug,
  getRelatedProducts,
  getAllProducts,
} from "@/lib/db/product";

export const dynamic =
  "force-dynamic";

const RELATED_PRODUCT_LIMIT = 8;

export default async function ProductPage({
  params,
}) {
  const { slug } = await params;

  const { env } =
    await getCloudflareContext({
      async: true,
    });

  const product =
    await getProductBySlug(
      env.DB,
      slug
    );

  if (!product) {
    notFound();
  }

  /*
   * ============================================================
   * YOU MAY ALSO LIKE
   * ============================================================
   */

  const sameCategoryProducts =
    await getRelatedProducts(
      env.DB,
      product.id,
      RELATED_PRODUCT_LIMIT
    );

  const selectedIds =
    new Set(
      sameCategoryProducts.map(
        (item) =>
          Number(item.id)
      )
    );

  /*
   * Never show the currently
   * viewed product.
   */
  selectedIds.add(
    Number(product.id)
  );

  let relatedProducts = [
    ...sameCategoryProducts,
  ];

  /*
   * Fill remaining slots with
   * other active products.
   */
  if (
    relatedProducts.length <
    RELATED_PRODUCT_LIMIT
  ) {
    const allActiveProducts =
      await getAllProducts(
        env.DB,
        {
          activeOnly: true,
        }
      );

    for (
      const item of
      allActiveProducts
    ) {
      const id =
        Number(item.id);

      if (
        selectedIds.has(id)
      ) {
        continue;
      }

      relatedProducts.push(
        item
      );

      selectedIds.add(id);

      if (
        relatedProducts.length >=
        RELATED_PRODUCT_LIMIT
      ) {
        break;
      }
    }
  }

  /*
   * ============================================================
   * REVIEWS
   * ============================================================
   */

  const rawReviews =
    await ReviewService.getProductReviews(
      product.id
    );

  const reviews =
    rawReviews.map(
      (review) => ({
        id: review.id,

        name:
          review.reviewer_name ||
          "Verified Customer",

        rating:
          Number(
            review.rating || 0
          ),

        comment:
          review.comment ||
          review.review_text ||
          "",

        date:
          review.created_at
            ? new Date(
                review.created_at
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
            : "",
      })
    );

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
            pb-12
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

          <Breadcrumb
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Products",
              },
              {
                label: product.name,
              },
            ]}
          />

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

            <ProductGallery
              images={
                product.images
              }
              productId={
                product.id
              }
            />

            <ProductDetails
              product={product}
            />

          </div>
        </section>

        {/* YOU MAY ALSO LIKE */}
        <RelatedProducts
          products={
            relatedProducts
          }
        />

        {/* REVIEWS */}
        <ReviewSection
          product={product}
          reviews={reviews}
        />

      </main>
    </>
  );
}