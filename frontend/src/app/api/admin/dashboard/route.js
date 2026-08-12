import { AnalyticsController } from "@/controllers/AnalyticsController";

export const runtime = "edge";

export async function GET(request) {
  return await AnalyticsController.getDashboardStats(request);
}
