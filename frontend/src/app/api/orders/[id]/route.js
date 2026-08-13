import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getOrderById } from "@/lib/db/order";

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId") || 1);

    const order = await getOrderById(
      env.DB,
      Number(id),
      userId
    );

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
