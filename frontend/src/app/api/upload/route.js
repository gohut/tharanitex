import { ApiResponse } from "@/utils/ApiResponse";
import { authenticateAdmin } from "@/middleware/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    // Only admins can upload product images
    if (!await authenticateAdmin(request, env)) {
      return ApiResponse.forbidden("Admin access required");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return ApiResponse.badRequest("No file uploaded or invalid file format");
    }

    const bucket = env?.PRODUCT_IMAGES || env?.tharani_product_images || (typeof process !== "undefined" && process.env?.BUCKET);
    if (!bucket) {
      return ApiResponse.error("R2 storage bucket binding not found");
    }

    // Generate unique key for storage
    const extension = file.name?.split(".").pop() || "jpg";
    const key = `products/${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    // Upload to R2 Bucket
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });

    return ApiResponse.success({ image_key: key, url: `/api/images/${key}` }, "Image uploaded successfully to R2", 201);
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}
