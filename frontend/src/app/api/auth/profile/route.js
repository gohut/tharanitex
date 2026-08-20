import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  return await AuthController.getProfile(request, env);
}

export async function PUT(request) {
  const { env } = await getCloudflareContext({ async: true });
  return await AuthController.updateProfile(request, env);
}
