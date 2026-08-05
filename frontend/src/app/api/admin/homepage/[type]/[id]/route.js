import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  deleteHeroSlide,
  deletePromoBanner,
  getHeroSlideById,
  getPromoBannerById,
  updateHeroSlide,
  updatePromoBanner,
} from "@/lib/db/homepage";

function getR2Key(imageUrl) {
  const prefix = "/api/images/";
  return imageUrl?.startsWith(prefix) ? imageUrl.slice(prefix.length) : null;
}

async function getExisting(db, type, id) {
  if (type === "hero") return getHeroSlideById(db, id);
  if (type === "banner") return getPromoBannerById(db, id);
  return null;
}

export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { type, id } = await params;
    const body = await request.json();
    const existing = await getExisting(env.DB, type, id);

    if (!existing) {
      return Response.json(
        { success: false, error: "Homepage content not found" },
        { status: 404 }
      );
    }

    if (type === "hero") {
      await updateHeroSlide(env.DB, id, body);
    } else if (type === "banner") {
      await updatePromoBanner(env.DB, id, body);
    } else {
      return Response.json(
        { success: false, error: "Unsupported homepage CMS type" },
        { status: 400 }
      );
    }

    const oldKey = getR2Key(existing.image);
    const newKey = getR2Key(body.image);

    if (oldKey && oldKey !== newKey) {
      await env.tharani_product_images.delete(oldKey);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin homepage PATCH error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to update homepage content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { type, id } = await params;
    const existing = await getExisting(env.DB, type, id);

    if (!existing) {
      return Response.json(
        { success: false, error: "Homepage content not found" },
        { status: 404 }
      );
    }

    if (type === "hero") {
      await deleteHeroSlide(env.DB, id);
    } else if (type === "banner") {
      await deletePromoBanner(env.DB, id);
    } else {
      return Response.json(
        { success: false, error: "Unsupported homepage CMS type" },
        { status: 400 }
      );
    }

    const key = getR2Key(existing.image);
    if (key) {
      await env.tharani_product_images.delete(key);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin homepage DELETE error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to delete homepage content" },
      { status: 500 }
    );
  }
}
