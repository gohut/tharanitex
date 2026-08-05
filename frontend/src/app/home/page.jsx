import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import PromoBanner from "@/components/home/PromoBanner/PromoBanner";
import ProductSection from "@/components/home/ProductSection/ProductSection";
import WhySection from "@/components/home/WhySection/WhySection";

async function getHomeData() {
  const res = await fetch("http://127.0.0.1:8787/api/home", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load homepage");
  }

  return res.json();
}

export default async function HomePage() {
  const data = await getHomeData();

  // Only render active sections, in the order chosen by admin.
  const sections = (data.homepageSections || [])
    .filter((section) => section.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getBanner = (referenceId) => {
    return data.promoBanners?.find(
      (banner) => Number(banner.id) === Number(referenceId)
    );
  };

  const renderSection = (section) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <Hero
            key={section.id}
            slides={data.heroSlides || []}
          />
        );

      case "categories":
        return (
          <Categories
            key={section.id}
            categories={data.categories}
          />
        );

      case "banner": {
        const banner = getBanner(section.referenceId);

        if (!banner) return null;

        return (
          <PromoBanner
            key={section.id}
            banner={banner}
          />
        );
      }

      case "new_arrivals":
        return (
          <ProductSection
            key={section.id}
            title="New Arrivals"
            products={data.newArrivals || []}
          />
        );

      case "best_sellers":
        return (
          <ProductSection
            key={section.id}
            title="Best Sellers"
            products={data.bestSellers || []}
          />
        );

      case "why_tharani":
        return (
          <WhySection
            key={section.id}
            content={data.whyTharani}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="bg-[#FBF5EA]">
      <Navbar />

      {sections.map(renderSection)}
    </main>
  );
}