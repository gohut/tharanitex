import {
  getBestSellerProducts,
  getNewArrivalProducts,
  getProductsByIds,
} from "@/lib/db/product";
import { getAllCategories } from "@/lib/db/category";
import {
  getHeroSlides,
  getHomepageSettings,
  getPromoBanners,
  getHomepageSections,
  shapeWhyTharani,
} from "@/lib/db/homepage";

export function getFallbackHomeData() {
  const defaultSettings = {
    categories_title: "Explore Elegance",
    categories_subtitle: "Discover handcrafted sarees where timeless tradition meets effortless elegance.",
    why_title: "Crafted With Heritage",
    why_heading: "Crafted With Heritage",
    why_subtitle: "For those who appreciate timeless craftsmanship",
    why_features: '[{"title":"Pure Silk","description":"Finest quality silk. Timeless, soft and smooth."},{"title":"Authenticity","description":"Pure saree work that reflects tradition."},{"title":"Handwoven","description":"Meticulously handwoven by skilled artisans."}]',
  };

  return {
    heroSlides: [
      {
        id: 1,
        image: "/assets/banner1.png",
        title: "Pure Kanchipuram Silk Sarees",
        subtitle: "Handwoven with timeless elegance and gold zari",
        buttonText: "Explore Collection",
        buttonLink: "/collections",
      },
    ],
    categories: {
      title: defaultSettings.categories_title,
      subtitle: defaultSettings.categories_subtitle,
      items: [],
    },
    promoBanners: [],
    newArrivals: [],
    bestSellers: [],
    whyTharani: shapeWhyTharani(defaultSettings),
    homepageSections: [
      { id: 1, sectionType: "hero", sortOrder: 1, isActive: 1 },
      { id: 2, sectionType: "categories", sortOrder: 2, isActive: 1 },
      { id: 3, sectionType: "new_arrivals", sortOrder: 3, isActive: 1 },
      { id: 4, sectionType: "best_sellers", sortOrder: 4, isActive: 1 },
      { id: 5, sectionType: "why_tharani", sortOrder: 5, isActive: 1 },
    ],
    showcaseProducts: {},
  };
}

export async function getHomeData(db) {
  if (!db) return getFallbackHomeData();

  try {
    const [
      heroSlides,
      categoryItems,
      promoBanners,
      settings,
      newArrivals,
      bestSellers,
      homepageSections,
    ] = await Promise.all([
      getHeroSlides(db, { activeOnly: true }).catch(() => []),
      getAllCategories(db, { activeOnly: true }).catch(() => []),
      getPromoBanners(db, { activeOnly: true }).catch(() => []),
      getHomepageSettings(db).catch(() => ({})),
      getNewArrivalProducts(db).catch(() => []),
      getBestSellerProducts(db).catch(() => []),
      getHomepageSections(db).catch(() => []),
    ]);

    const showcaseSections = (homepageSections || []).filter(
      (section) => section.sectionType === "product_showcase"
    );
    const productsBySection = await Promise.all(
      showcaseSections.map(async (section) => [
        section.id,
        await getProductsByIds(db, section.productIds).catch(() => []),
      ])
    );
    const showcaseProducts = Object.fromEntries(productsBySection);

    const fallback = getFallbackHomeData();
    const defaultSettings = {
      categories_title: "Explore Elegance",
      categories_subtitle: "Discover handcrafted sarees where timeless tradition meets effortless elegance.",
      why_title: "Crafted With Heritage",
      why_heading: "Crafted With Heritage",
      why_subtitle: "For those who appreciate timeless craftsmanship",
      why_features: '[{"title":"Pure Silk","description":"Finest quality silk. Timeless, soft and smooth."},{"title":"Authenticity","description":"Pure saree work that reflects tradition."},{"title":"Handwoven","description":"Meticulously handwoven by skilled artisans."}]',
    };
    const mergedSettings = { ...defaultSettings, ...(settings || {}) };

    return {
      heroSlides: (heroSlides && heroSlides.length) ? heroSlides : fallback.heroSlides,
      categories: {
        title: mergedSettings.categories_title,
        subtitle: mergedSettings.categories_subtitle,
        items: categoryItems || [],
      },
      promoBanners: promoBanners || [],
      newArrivals: newArrivals || [],
      bestSellers: bestSellers || [],
      whyTharani: shapeWhyTharani(mergedSettings),
      homepageSections: (homepageSections && homepageSections.length) ? homepageSections : fallback.homepageSections,
      showcaseProducts: showcaseProducts || {},
    };
  } catch (error) {
    console.error("getHomeData error:", error);
    return getFallbackHomeData();
  }
}
