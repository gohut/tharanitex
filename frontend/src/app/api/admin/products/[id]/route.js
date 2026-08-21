import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImages,
  addProductImage,
  getAllProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
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

    const variants = await getAllProductVariants(env.DB, id);

    product.variants = variants;

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

    // Update product images
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

    // Update product variants
    if (Array.isArray(body.variants)) {
      const existingVariants = await getAllProductVariants(
        env.DB,
        id
      );

      const incomingIds = body.variants
        .filter((variant) => variant?.id)
        .map((variant) => Number(variant.id));

      // Delete variants removed from editor
      for (const existing of existingVariants) {
        if (!incomingIds.includes(Number(existing.id))) {
          await deleteProductVariant(
            env.DB,
            existing.id
          );
        }
      }

      // Create / update variants
      for (const variant of body.variants) {
        if (!variant?.name?.trim()) {
          continue;
        }

        if (variant.id) {
          await updateProductVariant(env.DB, {
            id: Number(variant.id),
            name: variant.name.trim(),
            sku: variant.sku?.trim() || null,
            price: Number(variant.price) || 0,
            stock: Number(variant.stock) || 0,
            imageUrl: variant.imageUrl || null,
            isActive: variant.isActive !== false,
          });
        } else {
          await createProductVariant(env.DB, {
            productId: Number(id),
            name: variant.name.trim(),
            sku: variant.sku?.trim() || null,
            price: Number(variant.price) || 0,
            stock: Number(variant.stock) || 0,
            imageUrl: variant.imageUrl || null,
          });
        }
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

    /*
     * Get image URLs before deletion/archiving.
     * We only remove them from R2 if the product is
     * actually permanently deleted.
     */
    const { results: images } = await env.DB
      .prepare(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ?
      `)
      .bind(Number(id))
      .all();

    /*
     * deleteProduct() decides whether this is:
     *
     * 1. Permanent deletion
     * 2. Soft deletion / archival
     */
    const result = await deleteProduct(env.DB, id);

    /*
     * Only delete R2 images when the database product
     * was actually permanently deleted.
     *
     * Archived products keep their images.
     */
    if (result.deleted) {
      const prefix = "/api/images/";

      for (const image of images) {
        if (image.image_url?.startsWith(prefix)) {
          const key = image.image_url.slice(prefix.length);

          await env.tharani_product_images.delete(key);
        }
      }
    }

    return Response.json({
      success: true,
      deleted: result.deleted,
      archived: result.archived,
      message: result.archived
        ? "Product has existing orders and was archived instead of permanently deleted."
        : "Product deleted successfully.",
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