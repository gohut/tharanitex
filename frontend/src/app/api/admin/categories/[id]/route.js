import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  categoryHasProducts,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/lib/db/category";

function getR2Key(imageUrl) {
  const prefix = "/api/images/";
  return imageUrl?.startsWith(prefix) ? imageUrl.slice(prefix.length) : null;
}

export async function GET(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    const category = await getCategoryById(env.DB, id);

    if (!category) {
      return Response.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json(category);
  } catch (error) {
    console.error("Category GET error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to load category" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    const body = await request.json();
    const existing = await getCategoryById(env.DB, id);

    if (!existing) {
      return Response.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await updateCategory(env.DB, id, {
      name: body.name,
      slug: body.slug,
      subtitle: body.subtitle || "",
      description: body.description || "",
      image: body.image || null,
      isActive: body.isActive !== false,
    });

    const oldKey = getR2Key(existing.image);
    const newKey = getR2Key(body.image);

    if (oldKey && oldKey !== newKey) {
      await env.tharani_product_images.delete(oldKey);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Category PATCH error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;
    const category = await getCategoryById(env.DB, id);

    if (!category) {
      return Response.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (await categoryHasProducts(env.DB, id)) {
      return Response.json(
        {
          success: false,
          error: "Cannot delete category because products are assigned to it.",
        },
        { status: 409 }
      );
    }

    await deleteCategory(env.DB, id);

    const key = getR2Key(category.image);
    if (key) {
      await env.tharani_product_images.delete(key);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
