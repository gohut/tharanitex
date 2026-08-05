import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createHeroSlide,
  createPromoBanner,
  getHeroSlides,
  getHomepageSettings,
  getPromoBanners,
  shapeWhyTharani,
  updateHomepageSettings,
} from "@/lib/db/homepage";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const [heroSlides, promoBanners, settings] = await Promise.all([
      getHeroSlides(env.DB),
      getPromoBanners(env.DB),
      getHomepageSettings(env.DB),
    ]);

    return Response.json({
      heroSlides,
      promoBanners,
      settings: {
        categoriesTitle: settings.categories_title,
        categoriesSubtitle: settings.categories_subtitle,
        whyTitle: settings.why_title,
        whyHeading: settings.why_heading,
        whySubtitle: settings.why_subtitle,
        whyFeatures: shapeWhyTharani(settings).features,
      },
    });
  } catch (error) {
    console.error("Admin homepage GET error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to load homepage CMS" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { env } = getCloudflareContext();
    const body = await request.json();

    if (body.type === "hero") {
      if (!body.image) {
        return Response.json(
          { success: false, error: "Hero image is required" },
          { status: 400 }
        );
      }

      return Response.json(await createHeroSlide(env.DB, body), { status: 201 });
    }

    if (body.type === "banner") {
      if (!body.image) {
        return Response.json(
          { success: false, error: "Banner image is required" },
          { status: 400 }
        );
      }

      return Response.json(await createPromoBanner(env.DB, body), { status: 201 });
    }

    if (body.type === "settings") {
      await updateHomepageSettings(env.DB, {
        categories_title: body.categoriesTitle,
        categories_subtitle: body.categoriesSubtitle,
        why_title: body.whyTitle,
        why_heading: body.whyHeading,
        why_subtitle: body.whySubtitle,
        why_features: JSON.stringify(body.whyFeatures || []),
      });

      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: "Unsupported homepage CMS type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin homepage POST error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to save homepage CMS" },
      { status: 500 }
    );
  }
}
