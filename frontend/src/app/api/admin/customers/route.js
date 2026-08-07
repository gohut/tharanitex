import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getAllCustomers,
  getCustomerStats,
} from "@/lib/db/customer";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const [customers, stats] = await Promise.all([
      getAllCustomers(env.DB),
      getCustomerStats(env.DB),
    ]);

    return Response.json({
      customers,
      stats: {
        totalCustomers:
          Number(stats?.totalCustomers) || 0,

        activeCustomers:
          Number(stats?.activeCustomers) || 0,

        blockedCustomers:
          Number(stats?.blockedCustomers) || 0,

        newThisMonth:
          Number(stats?.newThisMonth) || 0,
      },
    });
  } catch (error) {
    console.error("Admin customers GET error:", error);

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to load customers",
      },
      { status: 500 }
    );
  }
}