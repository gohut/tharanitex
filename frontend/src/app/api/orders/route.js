import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createOrder,
  getOrders,
} from "@/lib/db/order";
import { validateCheckoutDetails } from "@/lib/checkout";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

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
    const { env } = await getCloudflareContext({ async: true });

    const body = await request.json();
    const details = {
      name: body.customerName || "",
      phone: body.phone || "",
      otp: body.otp || "",
      address: body.deliveryAddress || "",
      paymentMethod: body.paymentMethod || "",
    };
    const errors = validateCheckoutDetails(details);
    if (Object.keys(errors).length) {
      return Response.json({ success: false, error: Object.values(errors)[0], errors }, { status: 400 });
    }
    if (details.paymentMethod !== "COD") {
      return Response.json({ success: false, error: "Online payment is currently unavailable." }, { status: 400 });
    }

    const order = await createOrder(
      env.DB,
      {
        // The cart and customer order pages currently use this test customer split:
        // guest cart data is converted into orders visible to user 1.
        userId: 1,
        customerName: details.name.trim(),
        phone: details.phone.trim(),
        deliveryAddress: details.address.trim(),
        paymentMethod: details.paymentMethod,
      }
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
