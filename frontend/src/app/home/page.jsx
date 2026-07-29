import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import ProductSection from "@/components/home/ProductSection/ProductSection";
import PromoBanner from "@/components/home/PromoBanner/PromoBanner";
import WhySection from "@/components/home/WhySection/WhySection";
import Footer from "@/components/home/Footer/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F2E8]">
      <Navbar />

      <Hero />

      <Categories />

      <ProductSection />

      <PromoBanner />

      <WhySection />

      <Footer />
    </main>
  );
}