import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllProducts } from "@/lib/db/product";

export async function GET() {
  const { env } = getCloudflareContext();

  const products = await getAllProducts(env.DB);

  return Response.json(products);
}