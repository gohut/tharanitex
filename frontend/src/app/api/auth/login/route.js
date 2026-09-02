import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AuthController.login(request, env);
}
