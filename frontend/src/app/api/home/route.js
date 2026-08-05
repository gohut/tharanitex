import { getCloudflareContext } from "@opennextjs/cloudflare";
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

export async function GET() {
  const { env } = getCloudflareContext();

  const [
    heroSlides,
    categoryItems,
    promoBanners,
    settings,
    newArrivals,
    bestSellers,
    homepageSections,
  ] = await Promise.all([
    getHeroSlides(env.DB, { activeOnly: true }),
    getAllCategories(env.DB, { activeOnly: true }),
    getPromoBanners(env.DB, { activeOnly: true }),
    getHomepageSettings(env.DB),
    getNewArrivalProducts(env.DB),
    getBestSellerProducts(env.DB),

    // Dynamic homepage layout
    getHomepageSections(env.DB),
  ]);

  return Response.json({
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
  });
}
