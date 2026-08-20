import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const { key } = await params;

    const objectKey = Array.isArray(key)
      ? key.join("/")
      : key;

    const bucket = env.PRODUCT_IMAGES || env.tharani_product_images;

    if (!bucket) {
      console.error("R2 bucket binding not found");
      return new Response("Storage binding not found", { status: 500 });
    }

    const object = await bucket.get(objectKey);

    if (!object) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    const headers = new Headers();

    if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    } else if (objectKey.endsWith(".png")) {
      headers.set("content-type", "image/png");
    } else if (objectKey.endsWith(".jpg") || objectKey.endsWith(".jpeg")) {
      headers.set("content-type", "image/jpeg");
    } else if (objectKey.endsWith(".webp")) {
      headers.set("content-type", "image/webp");
    }

    if (object.httpEtag) {
      headers.set("etag", object.httpEtag);
    }
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