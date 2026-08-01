import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getFeaturedProducts } from "@/lib/db/product";

export async function GET() {
  const { env } = getCloudflareContext();

  const products = await getFeaturedProducts(env.DB);

  return Response.json({
    newArrivals: products,
    bestSellers: products,
  });
}