import { ApiResponse } from "@/utils/ApiResponse";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams.key) {
      return ApiResponse.badRequest("Invalid file key");
    }

    const key = Array.isArray(resolvedParams.key)
      ? resolvedParams.key.join("/")
      : resolvedParams.key;

    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const bucket = env?.PRODUCT_IMAGES || env?.tharani_product_images || (typeof process !== "undefined" && process.env?.BUCKET);
    if (!bucket) {
      return ApiResponse.error("R2 storage bucket binding not found");
    }

    const object = await bucket.get(key);
    if (!object) {
      return ApiResponse.notFound("Requested image not found in storage");
    }

    const headers = new Headers();
    if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    } else if (key.endsWith(".png")) {
      headers.set("content-type", "image/png");
    } else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) {
      headers.set("content-type", "image/jpeg");
    } else if (key.endsWith(".webp")) {
      headers.set("content-type", "image/webp");
    }

    if (object.httpEtag) {
      headers.set("etag", object.httpEtag);
    }
    headers.set("Content-Length", String(object.size));
    // Enable browser caching for 1 year since product images are static
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}