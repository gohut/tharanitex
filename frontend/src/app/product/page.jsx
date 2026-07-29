"use client";

import Navbar from "@/components/home/Navbar/Navbar";
import RelatedProducts from "@/components/product/RelatedProducts";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ReviewSection from "@/components/product/ReviewSection";

import { productData } from "@/data/productData";

export default function ProductPage() {

  return (
    <>
      <Navbar />

      <main className="bg-[#FBF5EA]">

        <section className="max-w-[1440px] mx-auto px-10 py-10">

          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "New Arrivals" },
              { label: productData.name },
            ]}
          />

          <div className="grid grid-cols-2 gap-24 mt-10">

            <ProductGallery
              images={productData.images}
            />

            <ProductDetails
              product={productData}
            />

          </div>

        </section>

        <RelatedProducts
          products={productData.relatedProducts}
        />

        <ReviewSection
          reviews={productData.reviews}
        />

      </main>

    </>
  );
}