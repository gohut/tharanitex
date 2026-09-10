import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateAdmin } from "@/middleware/auth";
import {
  getAllCustomers,
  getCustomerStats,
} from "@/lib/db/customer";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const admin = await authenticateAdmin(request, env);
    if (!admin) {
      return Response.json(
        { success: false, error: "UNAUTHORIZED", message: "Admin access required." },
        { status: 401 }
      );
    }

    const [customers, stats] = await Promise.all([
      getAllCustomers(env.DB),
      getCustomerStats(env.DB),
    ]);

    return Response.json({
      customers,
      stats: {
        totalCustomers: Number(stats?.totalCustomers) || 0,
        activeCustomers: Number(stats?.activeCustomers) || 0,
        blockedCustomers: Number(stats?.blockedCustomers) || 0,
        newThisMonth: Number(stats?.newThisMonth) || 0,
      },
    });
  } catch (error) {
    console.error("Admin customers GET error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load customers",
      },
      { status: 500 }
    );
  }
}