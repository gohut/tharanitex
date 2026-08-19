import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getOrderById } from "@/lib/db/order";
import { requireCustomer } from "@/lib/checkout-auth";

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { id } = await params;

    const userId = await requireCustomer(request, env);

    const order = await getOrderById(env.DB, Number(id), userId);

    if (!order) {
      return Response.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return Response.json(order);
  } catch (error) {
    console.error("GET order error:", error);

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load order" },
      { status: error?.status || 500 }
    );
  }
}
