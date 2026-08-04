import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createOrder,
  getOrders,
} from "@/lib/db/order";

export async function GET(request) {
  try {
    const { env } = getCloudflareContext();

    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId") || 1);

    const orders = await getOrders(env.DB, userId);

    return Response.json(orders);
  } catch (error) {
    console.error("GET orders error:", error);

    return Response.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { env } = getCloudflareContext();

    const body = await request.json();

    // Temporary test values.
    // Authentication + checkout will provide these later.
    const userId = Number(body.userId || 1);
    const addressId = Number(body.addressId || 1);

    const order = await createOrder(
      env.DB,
      userId,
      addressId
    );

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error("CREATE order error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 400 }
    );
  }
}