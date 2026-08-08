import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";
import Categories from "@/components/home/Categories/Categories";
import PromoBanner from "@/components/home/PromoBanner/PromoBanner";
import ProductSection from "@/components/home/ProductSection/ProductSection";
import WhySection from "@/components/home/WhySection/WhySection";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getHomeData } from "@/lib/db/home-data";
  
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { env } = await getCloudflareContext({ async: true });
  const data = await getHomeData(env.DB);

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
            subtitle="Freshly woven treasures, crafted to bring a touch of tradition to every occasion."
            products={data.newArrivals || []}
          />
        );

      case "best_sellers":
        return (
          <ProductSection
            key={section.id}
            title="Best Sellers"
            subtitle="Loved for their timeless beauty, chosen for moments that deserve something special."
            products={data.bestSellers || []}
            backgroundImage="/assets/backgrounds/best-sellers-bg.png"
          />
        );

      case "why_tharani":
        return (
          <WhySection
            key={section.id}
            subtitle="Rooted in craftsmanship, woven with tradition, and made to be cherished for generations."
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
