import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  return await AuthController.googleLogin(request, env);
}