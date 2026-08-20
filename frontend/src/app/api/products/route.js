import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllProducts } from "@/lib/db/product";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env?.DB) return Response.json([]);
    const products = await getAllProducts(env.DB);
    return Response.json(products || []);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return Response.json([]);
  }
}