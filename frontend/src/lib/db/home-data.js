import {
  getBestSellerProducts,
  getNewArrivalProducts,
} from "@/lib/db/product";
import { getAllCategories } from "@/lib/db/category";
import {
  getHeroSlides,
  getHomepageSettings,
  getPromoBanners,
  getHomepageSections,
  shapeWhyTharani,
} from "@/lib/db/homepage";

export async function getHomeData(db) {
  const [
    heroSlides,
    categoryItems,
    promoBanners,
    settings,
    newArrivals,
    bestSellers,
    homepageSections,
  ] = await Promise.all([
    getHeroSlides(db, { activeOnly: true }),
    getAllCategories(db, { activeOnly: true }),
    getPromoBanners(db, { activeOnly: true }),
    getHomepageSettings(db),
    getNewArrivalProducts(db),
    getBestSellerProducts(db),
    getHomepageSections(db),
  ]);

  return {
    heroSlides,
    categories: {
      title: settings.categories_title,
      subtitle: settings.categories_subtitle,
      items: categoryItems,
    },
    promoBanners,
    newArrivals,
    bestSellers,
    whyTharani: shapeWhyTharani(settings),
    homepageSections,
  };
}
