import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAdminOrders } from "@/lib/db/order";
import { requireAdmin, errorResponse } from "@/lib/order-access";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await requireAdmin(request, env);
    return Response.json(await getAdminOrders(env.DB));
  } catch (error) { return errorResponse(error); }
}
