import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, getOrderById } from "@/lib/db/order";
import { requireCustomer } from "@/lib/checkout-auth";
import { errorResponse } from "@/lib/order-access";

const ELIGIBLE = new Set(["placed", "confirmed"]);

export async function POST(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const customerId = await requireCustomer(request, env);
    const { id } = await params;
    const order = await getOrderById(env.DB, Number(id), customerId);
    if (!order) throw new CheckoutError("Order not found.", 404);
    if (!ELIGIBLE.has(String(order.order_status).toLowerCase())) throw new CheckoutError("Cancellation is not available for this order.", 422);
    if (order.cancellation_status === "REQUESTED") throw new CheckoutError("A cancellation request is already pending.", 409);
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    await env.DB.prepare("UPDATE orders SET cancellation_status = 'REQUESTED', cancellation_reason = ?, cancellation_requested_at = datetime('now') WHERE id = ? AND user_id = ?").bind(reason || null, id, customerId).run();
    const rawNumber = env.WHATSAPP_ADMIN_NUMBER || process.env.WHATSAPP_ADMIN_NUMBER || "919344474088";
    const number = String(rawNumber).replace(/\D/g, "");
    const message = `Tharani Textiles - Order Cancellation Request\n\nOrder ID: ${id}\nCustomer: ${order.full_name}\nPhone: ${order.phone}\nOrder Date: ${order.created_at}\nCurrent Status: ${order.order_status}\nPayment Status: ${order.payment_status}\nPayment Method: ${order.payment_method}\nTotal: Rs. ${order.total_amount}\nItems: ${(order.items || []).map((item) => `${item.name} x${item.quantity}`).join(", ")}\nReason: ${reason || "Not provided"}`;
    console.info("Cancellation request recorded", { orderId: id, customerId });
    return Response.json({ success: true, whatsappUrl: number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null, message: "Cancellation request recorded." }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
