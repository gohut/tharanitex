import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  return await AuthController.logout(request, env);
}
