import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, prepareOnlineCheckout } from "@/lib/db/order";
import { validateCheckoutDetails } from "@/lib/checkout";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { requireCustomer } from "@/lib/checkout-auth";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") throw new CheckoutError("Invalid checkout request.");
    const details = { name: body.customerName || "", phone: body.phone || "", address: body.deliveryAddress || "", paymentMethod: body.paymentMethod || "" };
    const errors = validateCheckoutDetails(details);
    if (Object.keys(errors).length) throw new CheckoutError(Object.values(errors)[0]);
    if (!["UPI", "CARD"].includes(details.paymentMethod)) throw new CheckoutError("Choose UPI or Card for online payment.");
    const checkoutType = body.checkoutType === "BUY_NOW" ? "BUY_NOW" : body.checkoutType === "CART" ? "CART" : null;
    if (!checkoutType) throw new CheckoutError("Invalid checkout type.");
    const userId = await requireCustomer(request, env);
    const payment = await prepareOnlineCheckout(env.DB, {
      userId,
      cartUserId: userId,
      checkoutType,
      productId: body.productId,
      variantId: body.variantId ?? null,
      quantity: body.quantity,
      paymentMethod: details.paymentMethod,
      customerName: details.name.trim(),
      phone: details.phone.trim(),
      deliveryAddress: details.address.trim(),
      idempotencyKey: body.idempotencyKey,
    }, (input) => createRazorpayOrder(env, input), getRazorpayKeyId(env));
    return Response.json(payment, { status: 201 });
  } catch (error) {
    console.error("CREATE Razorpay order error", { message: error?.message });
    return Response.json({ error: error instanceof CheckoutError ? error.message : "Unable to initialize online payment." }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
