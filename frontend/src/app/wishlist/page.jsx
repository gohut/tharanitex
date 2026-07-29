import Navbar from "@/components/home/Navbar/Navbar";
import Footer from "@/components/home/Footer/Footer";
import ProductCard from "@/components/home/ProductSection/ProductCard";

export default function WishlistPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F8F2E8] min-h-screen">

        {/* Heading */}

        <section className="bg-white border-b border-[#E8DCCB]">
          <div className="max-w-7xl mx-auto px-6 py-12">

            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Tharani Textiles
            </p>

            <h1 className="mt-3 text-5xl lg:text-6xl font-serif text-[#5A1F2F]">
              My Wishlist
            </h1>

            <p className="mt-5 text-gray-600 max-w-2xl leading-7">
              Your curated collection of timeless silk sarees. Save your favourite
              pieces and revisit them anytime before making your purchase.
            </p>

          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-5 text-sm text-gray-500">

          Home

          <span className="mx-2">/</span>

          Wishlist

        </section>
        
        {/* Products */}

        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {wishlistItems.map((product)=>(

              <ProductCard
                key={product.id}
                product={product}
                wishlist={true}
              />

            ))}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}