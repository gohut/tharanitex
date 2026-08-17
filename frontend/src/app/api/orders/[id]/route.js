import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getOrderById } from "@/lib/db/order";
import { getCustomerId } from "@/lib/checkout-auth";

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { id } = await params;

    const customerId = await getCustomerId(request, env);
    const fallbackUserId = Number(new URL(request.url).searchParams.get("userId") || 1);
    const userId = customerId || String(fallbackUserId);

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
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}
