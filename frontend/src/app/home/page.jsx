import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import PromoBanner from "@/components/home/PromoBanner/PromoBanner";
import ProductSection from "@/components/home/ProductSection/ProductSection";
import homeContent from "@/data/homeContent";
import WhySection from "@/components/home/WhySection/WhySection";

export default function HomePage() {
  return (
    <main className="bg-[#FBF5EA]">
      <Navbar />
      <Hero />
      <Categories />
      <PromoBanner banner={homeContent.promoBanner1} />
      <ProductSection
        title={homeContent.newArrivals.title}
        products={homeContent.newArrivals.items}
      />
      <PromoBanner banner={homeContent.promoBanner2} />
      <ProductSection
        title={homeContent.bestSellers.title}
        products={homeContent.bestSellers.items}
      />
      <WhySection />
    </main>
  );
}