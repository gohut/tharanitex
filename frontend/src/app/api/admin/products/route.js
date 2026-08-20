import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getAllProducts,
  createProduct,
  addProductImage,
  createProductVariant,
} from "@/lib/db/product";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const products = await getAllProducts(env.DB, {
      activeOnly: false,
    });

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
  const uploadedImages = [];

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

    // -----------------------------------
    // Generate a unique product slug
    // -----------------------------------

    const baseSlug =
      body.slug ||
      body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await env.DB.prepare(
        "SELECT id FROM products WHERE slug = ? LIMIT 1"
      )
        .bind(slug)
        .first();

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    // -----------------------------------
    // Remember R2 images for cleanup
    // -----------------------------------

    if (Array.isArray(body.images)) {
      for (const imageUrl of body.images) {
        if (
          typeof imageUrl === "string" &&
          imageUrl.startsWith("/api/images/")
        ) {
          const key = imageUrl
            .replace("/api/images/", "")
            .split("?")[0];

          if (key) {
            uploadedImages.push(decodeURIComponent(key));
          }
        }
      }
    }

    // -----------------------------------
    // Create product
    // -----------------------------------

    const result = await createProduct(env.DB, {
      name: body.name,
      slug,
      description: body.description || "",
      price: body.price,
      stock: body.stock || 0,
      categoryId: body.categoryId,
      featured: body.featured || false,
      isNewArrival: body.isNewArrival || false,
      isBestSeller: body.isBestSeller || false,
      isActive: body.isActive !== false,
    });

    // -----------------------------------
    // Add product images
    // -----------------------------------

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

        // -----------------------------------
    // Add product variants
    // -----------------------------------

    if (Array.isArray(body.variants)) {
      for (const variant of body.variants) {
        if (!variant?.name?.trim()) {
          continue;
        }

        await createProductVariant(env.DB, {
          productId: result.id,
          name: variant.name.trim(),
          sku: variant.sku?.trim() || null,
          price: Number(variant.price) || 0,
          stock: Number(variant.stock) || 0,
          imageUrl: variant.imageUrl || null,
        });
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

    // -----------------------------------
    // Cleanup R2 images if product creation
    // fails before they are attached
    // -----------------------------------

    try {
      const { env } = getCloudflareContext();

      for (const key of uploadedImages) {
        await env.tharani_product_images.delete(key);
      }
    } catch (cleanupError) {
      console.error(
        "R2 cleanup error:",
        cleanupError
      );
    }

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to create product",
      },
      { status: 500 }
    );
  }
}