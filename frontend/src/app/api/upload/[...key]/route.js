import { ApiResponse } from "@/utils/ApiResponse";

export const runtime = "edge";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams.key || !Array.isArray(resolvedParams.key)) {
      return ApiResponse.badRequest("Invalid file key");
    }

    const key = resolvedParams.key.join("/");
    const bucket = process.env.BUCKET;
    if (!bucket) {
      return ApiResponse.error("R2 storage bucket binding (BUCKET) not found in process.env");
    }

    const object = await bucket.get(key);
    if (!object) {
      return ApiResponse.notFound("Requested image not found in storage");
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    // Enable browser caching for 1 year since product images are static
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}
