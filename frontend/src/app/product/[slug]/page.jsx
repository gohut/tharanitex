import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";

import { productData } from "@/data/productData";

async function getProduct(slug) {
  const res = await fetch(
    `http://127.0.0.1:8787/api/products/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load product");
  }

  return res.json();
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProduct(slug);

  return (
    <>
      <Navbar />

      <main className="bg-[#FBF5EA]">
        <section className="mx-auto max-w-[1420px] px-5 pb-14 pt-5 md:px-8 lg:px-10 lg:pt-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Products" },
              { label: product.name },
            ]}
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,720px)_minmax(320px,1fr)] lg:gap-10 xl:gap-14">
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