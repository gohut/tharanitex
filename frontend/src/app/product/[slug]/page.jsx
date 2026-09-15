import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getProductBySlug,
  getProductVariants,
} from "@/lib/db/product";

export const dynamic =
  "force-dynamic";

async function getApprovedReviews(
  db,
  productId
) {
  try {
    const { results } =
      await db
        .prepare(`
          SELECT
            id,
            reviewer_name,
            customer_id,
            user_id,
            product_id,
            product_name,
            rating,
            comment,
            review_text,
            image_keys,
            status,
            created_at,
            updated_at
          FROM reviews
          WHERE product_id = ?
            AND LOWER(status) = 'approved'
          ORDER BY created_at DESC
        `)
        .bind(productId)
        .all();

    return results || [];
  } catch (error) {
    console.error(
      "Failed to load product reviews:",
      error
    );

    return [];
  }
}

export default async function ProductPage({
  params,
}) {
  const { slug } =
    await params;

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

  const variants =
    await getProductVariants(
      env.DB,
      product.id
    );

  const normalizedVariants = (Array.isArray(variants) ? variants : []).map((variant) => {
    let images = [];
    if (Array.isArray(variant.images) && variant.images.length > 0) {
      images = variant.images
        .map((img, idx) => ({
          id: img.id || null,
          imageUrl: img.imageUrl || img.image_url || (typeof img === "string" ? img : ""),
          sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
          isPrimary: Boolean(img.isPrimary ?? (idx === 0)),
        }))
        .filter((img) => Boolean(img.imageUrl));
    } else if (variant.imageUrl || variant.image_url) {
      const url = variant.imageUrl || variant.image_url;
      images = [{ id: null, imageUrl: url, sortOrder: 0, isPrimary: true }];
    }

    const primaryImage =
      images.find((img) => img.isPrimary)?.imageUrl ||
      images[0]?.imageUrl ||
      variant.imageUrl ||
      variant.image_url ||
      "";

    return {
      id: Number(variant.id),
      name: variant.name || "",
      sku: variant.sku || "",
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      imageUrl: primaryImage,
      images,
      isActive:
        variant.isActive !== undefined
          ? Boolean(variant.isActive)
          : variant.is_active !== undefined
          ? Boolean(variant.is_active)
          : true,
    };
  });

  const reviews =
    await getApprovedReviews(
      env.DB,
      product.id
    );

  return (
    <>
      <Navbar />

      <main className="bg-[#FBF5EA]">
        <section className="mx-auto w-full max-w-[430px] px-4 pb-12 pt-4 sm:px-5 sm:pb-14 sm:pt-5 md:px-8 lg:max-w-[1420px] lg:px-10 lg:pt-6">
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
                label:
                  product.name,
              },
            ]}
          />

          <div className="grid gap-7 sm:gap-8 lg:grid-cols-[minmax(0,720px)_minmax(320px,1fr)] lg:gap-10 xl:gap-14">
            <ProductGallery
              images={
                product.images ||
                []
              }
              variants={
                normalizedVariants
              }
            />

            <ProductDetails
              product={{
                ...product,
                variants:
                  normalizedVariants,
              }}
            />
          </div>
        </section>

        <RelatedProducts
          products={
            product.relatedProducts ||
            []
          }
        />

        <ReviewSection
          reviews={reviews}
        />
      </main>
    </>
  );
}