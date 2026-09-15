import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateAdmin } from "@/middleware/auth";
import {
  getAllProducts,
  createProduct,
  addProductImage,
  createProductVariant,
} from "@/lib/db/product";

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
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const admin = await authenticateAdmin(request, env);
    if (!admin) {
      return Response.json(
        { success: false, error: "UNAUTHORIZED", message: "Admin access required." },
        { status: 401 }
      );
    }

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

    // Generate a unique product slug
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

    // Remember R2 images for cleanup
    const collectR2Key = (url) => {
      if (typeof url === "string" && url.startsWith("/api/images/")) {
        const key = url.replace("/api/images/", "").split("?")[0];
        if (key) {
          uploadedImages.push(decodeURIComponent(key));
        }
      }
    };

    if (Array.isArray(body.images)) {
      for (const img of body.images) {
        const url = typeof img === "string" ? img : img?.imageUrl;
        collectR2Key(url);
      }
    }

    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (v?.imageUrl) collectR2Key(v.imageUrl);
        if (Array.isArray(v?.images)) {
          for (const img of v.images) {
            const url = typeof img === "string" ? img : img?.imageUrl;
            collectR2Key(url);
          }
        }
      }
    }

    // Create product
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

    // Add product images
    if (Array.isArray(body.images) && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        const item = body.images[i];
        const imageUrl = typeof item === "string" ? item : item?.imageUrl;
        const sortOrder =
          typeof item === "object" && item?.sortOrder !== undefined
            ? item.sortOrder
            : i;

        if (imageUrl) {
          await addProductImage(
            env.DB,
            result.id,
            imageUrl,
            sortOrder
          );
        }
      }
    }

    // Add product variants
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
          images: Array.isArray(variant.images)
            ? variant.images
            : variant.imageUrl
            ? [variant.imageUrl]
            : [],
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

    // Cleanup R2 images if product creation fails
    try {
      const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
      const r2 = env?.PRODUCT_IMAGES || env?.tharani_product_images;
      if (r2) {
        for (const key of uploadedImages) {
          await r2.delete(key);
        }
      }
    } catch (cleanupError) {
      console.error("R2 cleanup error:", cleanupError);
    }

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}