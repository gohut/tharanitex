import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getHomepageSections,
  createHomepageSection,
  reorderHomepageSections,
} from "@/lib/db/homepage";
import { getProductsByIds } from "@/lib/db/product";


export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const sections = await getHomepageSections(env.DB);

    return Response.json(sections);
  } catch (error) {
    console.error("Homepage sections GET error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load homepage sections",
      },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const { env } = getCloudflareContext();

    const body = await request.json();

    if (!body.sectionType) {
      return Response.json(
        {
          success: false,
          error: "Section type is required",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "hero",
      "categories",
      "banner",
      "new_arrivals",
      "best_sellers",
      "why_tharani",
      "product_showcase",
    ];

    if (!allowedTypes.includes(body.sectionType)) {
      return Response.json(
        {
          success: false,
          error: "Invalid section type",
        },
        { status: 400 }
      );
    }

    if (
      body.sectionType === "banner" &&
      !body.referenceId
    ) {
      return Response.json(
        {
          success: false,
          error: "Banner reference is required",
        },
        { status: 400 }
      );
    }

    if (body.sectionType === "product_showcase") {
      if (!body.title?.trim()) {
        return Response.json({ success: false, error: "Section title is required" }, { status: 400 });
      }
      if (!Array.isArray(body.productIds) || !body.productIds.length) {
        return Response.json({ success: false, error: "Select at least one product" }, { status: 400 });
      }
      const requestedIds = [...new Set(body.productIds.map(Number).filter(Number.isInteger))];
      const products = await getProductsByIds(env.DB, requestedIds);
      if (requestedIds.length !== products.length) {
        return Response.json({ success: false, error: "One or more selected products are unavailable" }, { status: 400 });
      }
      body.productIds = requestedIds;
    }

    const result = await createHomepageSection(
      env.DB,
      body
    );

    return Response.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error("Homepage section POST error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create homepage section",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request) {
  try {
    const { env } = getCloudflareContext();

    const body = await request.json();

    if (!Array.isArray(body.sections)) {
      return Response.json(
        {
          success: false,
          error: "Sections array is required",
        },
        { status: 400 }
      );
    }

    await reorderHomepageSections(
      env.DB,
      body.sections
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Homepage reorder error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to reorder homepage",
      },
      { status: 500 }
    );
  }
}
