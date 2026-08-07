import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getHomeData } from "@/lib/db/home-data";

export async function GET() {
  const { env } = getCloudflareContext();

  return Response.json(await getHomeData(env.DB));
}
