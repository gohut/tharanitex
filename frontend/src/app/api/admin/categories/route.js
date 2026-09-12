import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateAdmin } from "@/middleware/auth";
import {
  createCategory,
  getAllCategories,
} from "@/lib/db/category";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const admin = await authenticateAdmin(request, env);
    if (!admin) {
      return Response.json(
        { success: false, error: "UNAUTHORIZED", message: "Admin access required." },
        { status: 401 }
      );
    }

    const results = await getAllCategories(env.DB);

    return Response.json(results);
  } catch (error) {
    console.error("Categories GET error:", error);

    return Response.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const admin = await authenticateAdmin(request, env);
    if (!admin) {
      return Response.json(
        { success: false, error: "UNAUTHORIZED", message: "Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.name) {
      return Response.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const result = await createCategory(env.DB, {
      name: body.name.trim(),
      subtitle: body.subtitle || "",
      slug: body.slug,
      description: body.description || "",
      image: body.image || null,
      isActive: body.isActive !== false,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Category POST error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}
