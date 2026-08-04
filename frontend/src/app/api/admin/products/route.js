import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getAllProducts,
  createProduct,
  addProductImage,
} from "@/lib/db/product";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const products = await getAllProducts(env.DB);

    return Response.json(products);
  } catch (error) {
    console.error("Admin products GET error:", error);

    return Response.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { env } = getCloudflareContext();

    const body = await request.json();

    if (!body.name || !body.price || !body.categoryId) {
      return Response.json(
        {
          success: false,
          error: "Name, price and category are required",
        },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const result = await createProduct(env.DB, {
      name: body.name,
      slug,
      description: body.description || "",
      price: body.price,
      stock: body.stock || 0,
      categoryId: body.categoryId,
      featured: body.featured || false,
      isActive: body.isActive !== false,
    });

    if (Array.isArray(body.images) && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        await addProductImage(
          env.DB,
          result.id,
          body.images[i],
          i
        );
      }
    }

    return Response.json(
      {
        success: true,
        id: result.id,
        slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin product POST error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}