import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  updateHomepageSection,
  deleteHomepageSection,
} from "@/lib/db/homepage";
import { getProductsByIds } from "@/lib/db/product";


export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { id } = await params;
    const body = await request.json();

    if (body.sectionType === "product_showcase") {
      if (!body.title?.trim() || !Array.isArray(body.productIds) || !body.productIds.length) {
        return Response.json({ success: false, error: "A title and at least one product are required" }, { status: 400 });
      }
      const requestedIds = [...new Set(body.productIds.map(Number).filter(Number.isInteger))];
      const products = await getProductsByIds(env.DB, requestedIds);
      if (requestedIds.length !== products.length) {
        return Response.json({ success: false, error: "One or more selected products are unavailable" }, { status: 400 });
      }
      body.productIds = requestedIds;
    }

    await updateHomepageSection(
      env.DB,
      id,
      body
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Homepage section PATCH error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to update homepage section",
      },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { id } = await params;

    await deleteHomepageSection(
      env.DB,
      id
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Homepage section DELETE error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to delete homepage section",
      },
      { status: 500 }
    );
  }
}
