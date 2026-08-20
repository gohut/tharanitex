import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createCodOrder, CheckoutError, getOrders } from "@/lib/db/order";
import { validateCheckoutDetails } from "@/lib/checkout";
import { requireCustomer } from "@/lib/checkout-auth";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return Response.json(await getOrders(env.DB, await requireCustomer(request, env)));
  } catch (error) {
    console.error("GET orders error:", error);
    return Response.json({ error: error instanceof CheckoutError ? error.message : "Failed to load orders" }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new CheckoutError("Invalid checkout request.");

    const customerId = await requireCustomer(request, env);

    const details = { name: body.customerName || "", phone: body.phone || "", address: body.deliveryAddress || "", paymentMethod: body.paymentMethod || "" };
    const errors = validateCheckoutDetails(details);
    if (Object.keys(errors).length) return Response.json({ success: false, error: Object.values(errors)[0], errors }, { status: 400 });
    if (details.paymentMethod !== "COD") throw new CheckoutError("Use the online payment endpoint for UPI or card payments.", 400);
    const checkoutType = body.checkoutType === "BUY_NOW" ? "BUY_NOW" : body.checkoutType === "CART" || !body.checkoutType ? "CART" : null;
    if (!checkoutType) throw new CheckoutError("Invalid checkout type.");

    const orderUserId = String(customerId);
    const cartUserId = orderUserId;
    const order = await createCodOrder(env.DB, {
      userId: orderUserId,
      cartUserId,
      checkoutType,
      productId: body.productId,
      quantity: body.quantity,
      customerName: details.name.trim(),
      phone: details.phone.trim(),
      deliveryAddress: details.address.trim(),
    });
    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error("CREATE COD order error", { message: error?.message, context: error?.context });
    return Response.json({ success: false, error: error instanceof CheckoutError ? error.message : "Unable to create the order. Please try again." }, { status: error instanceof CheckoutError ? (error.status || 400) : 500 });
  }
}
