import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { key } = await params;

    const objectKey = Array.isArray(key)
      ? key.join("/")
      : key;

    const object = await env.tharani_product_images.get(objectKey);

    if (!object) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    headers.set("etag", object.httpEtag);
    headers.set("content-length", String(object.size));
    headers.set(
      "cache-control",
      "public, max-age=31536000, immutable"
    );

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Image GET error:", error);

    return new Response("Failed to load image", {
      status: 500,
    });
  }
}