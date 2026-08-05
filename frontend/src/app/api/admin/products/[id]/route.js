import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImages,
  addProductImage,
} from "@/lib/db/product";

export async function GET(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    const product = await getProductById(env.DB, id);

    if (!product) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error("Admin product GET error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load product",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { id } = await params;
    const body = await request.json();

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    await updateProduct(env.DB, id, {
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

    // If images were supplied, replace the existing image list.
    if (Array.isArray(body.images)) {
      await deleteProductImages(env.DB, id);

      for (let index = 0; index < body.images.length; index++) {
        await addProductImage(
          env.DB,
          id,
          body.images[index],
          index
        );
      }
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Admin product PATCH error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    // Get image URLs before deleting database records
    const { results: images } = await env.DB
      .prepare(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ?
      `)
      .bind(Number(id))
      .all();

    // Delete images from R2
    for (const image of images) {
      const prefix = "/api/images/";

      if (image.image_url?.startsWith(prefix)) {
        const key = image.image_url.slice(prefix.length);

        await env.tharani_product_images.delete(key);
      }
    }

    // deleteProduct() already removes product_images,
    // then removes the product
    await deleteProduct(env.DB, id);

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Admin product DELETE error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
