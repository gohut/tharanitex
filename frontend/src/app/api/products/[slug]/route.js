import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProductBySlug } from "@/lib/db/product";

export async function GET(request, context) {
  try {
    const { env } = getCloudflareContext();

    const { slug } = await context.params;

    const product = await getProductBySlug(env.DB, slug);

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json(product);
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}