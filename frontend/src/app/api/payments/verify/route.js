import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, claimVerifiedPayment } from "@/lib/db/order";
import { getRazorpayPayment, verifyRazorpaySignature } from "@/lib/razorpay";
import { requireCustomer } from "@/lib/checkout-auth";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json().catch(() => null);
    const orderId = body?.razorpay_order_id;
    const paymentId = body?.razorpay_payment_id;
    const signature = body?.razorpay_signature;
    if (![orderId, paymentId, signature].every((value) => typeof value === "string" && value.length > 0)) throw new CheckoutError("Invalid payment confirmation.");
    if (!(await verifyRazorpaySignature(env, orderId, paymentId, signature))) throw new CheckoutError("Payment verification failed.", 400);
    const session = await env.DB.prepare("SELECT amount_paise FROM checkout_sessions WHERE razorpay_order_id = ? LIMIT 1").bind(orderId).first();
    if (!session) throw new CheckoutError("Payment session not found.", 404);
    const payment = await getRazorpayPayment(env, paymentId);
    if (payment.order_id !== orderId || Number(payment.amount) !== Number(session.amount_paise) || payment.status !== "captured") {
      throw new CheckoutError("Payment could not be confirmed.", 400);
    }
    const result = await claimVerifiedPayment(env.DB, { razorpayOrderId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature, userId: await requireCustomer(request, env) });
    return Response.json({ success: true, orderId: result.orderId, paymentStatus: "paid", duplicate: result.duplicate });
  } catch (error) {
    console.error("VERIFY Razorpay payment error", { message: error?.message });
    return Response.json({ success: false, error: error instanceof CheckoutError ? error.message : "Unable to verify payment." }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
