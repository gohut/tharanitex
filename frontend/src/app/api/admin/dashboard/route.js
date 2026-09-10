import { AnalyticsController } from "@/controllers/AnalyticsController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AnalyticsController.getDashboardStats(request, env);
}
