import { ApiResponse } from "@/utils/ApiResponse";
import { authenticateAdmin } from "@/middleware/auth";

export const runtime = "edge";

export async function POST(request) {
  try {
    // Only admins can upload product images
    if (!await authenticateAdmin(request)) {
      return ApiResponse.forbidden("Admin access required");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return ApiResponse.badRequest("No file uploaded or invalid file format");
    }

    const bucket = process.env.BUCKET;
    if (!bucket) {
      return ApiResponse.error("R2 storage bucket binding (BUCKET) not found in process.env");
    }

    // Generate unique key for storage
    const extension = file.name.split(".").pop() || "jpg";
    const key = `products/${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    // Upload to R2 Bucket
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });

    return ApiResponse.success({ image_key: key }, "Image uploaded successfully to R2", 201);
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}
