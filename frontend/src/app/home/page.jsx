import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import PromoBanner from "@/components/home/PromoBanner/PromoBanner";
import ProductSection from "@/components/home/ProductSection/ProductSection";
import WhySection from "@/components/home/WhySection/WhySection";
import homeContent from "@/data/homeContent";

async function getHomeData() {
  const res = await fetch("http://127.0.0.1:8787/api/home", {
    cache: "no-store",
  });

  return res.json();
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <main className="bg-[#FBF5EA]">
      <Navbar />

      <Hero />

      <Categories />

      <PromoBanner banner={homeContent.promoBanner1} />

      <ProductSection
        title="New Arrivals"
        products={data.newArrivals}
      />

      <PromoBanner banner={homeContent.promoBanner2} />

      <ProductSection
        title="Best Sellers"
        products={data.bestSellers}
      />

      <WhySection />
    </main>
  );
}