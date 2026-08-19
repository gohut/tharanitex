import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, getAdminOrderById } from "@/lib/db/order";
import { requireAdmin, errorResponse } from "@/lib/order-access";

const FLOW = ["placed", "confirmed", "packed", "shipped", "delivered"];

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await requireAdmin(request, env);
    const { id } = await params;
    const order = await getAdminOrderById(env.DB, Number(id));
    if (!order) throw new CheckoutError("Order not found.", 404);
    return Response.json(order);
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const admin = await requireAdmin(request, env);
    const { id } = await params;
    const body = await request.json();
    const order = await getAdminOrderById(env.DB, Number(id));
    if (!order) throw new CheckoutError("Order not found.", 404);

    if (body.action === "cancellation") {
      if (order.cancellation_status !== "REQUESTED") throw new CheckoutError("No pending cancellation request.", 409);
      if (!["APPROVED", "REJECTED"].includes(body.decision)) throw new CheckoutError("Invalid cancellation decision.");
      if (body.decision === "APPROVED") {
        await env.DB.prepare("UPDATE orders SET cancellation_status = 'APPROVED', cancellation_decided_at = datetime('now'), cancelled_at = datetime('now'), cancelled_by = ?, order_status = 'cancelled' WHERE id = ?").bind(String(admin.userId), id).run();
      } else {
        await env.DB.prepare("UPDATE orders SET cancellation_status = 'REJECTED', cancellation_decided_at = datetime('now') WHERE id = ?").bind(id).run();
      }
    } else {
      const status = String(body.status || "").toLowerCase();
      const current = String(order.order_status).toLowerCase() === "processing" ? "confirmed" : String(order.order_status).toLowerCase();
      if (!FLOW.includes(status)) throw new CheckoutError("Invalid order status.");
      if (current === "cancelled" || FLOW.indexOf(status) !== FLOW.indexOf(current) + 1) throw new CheckoutError("Invalid order status transition.", 409);
      await env.DB.prepare("UPDATE orders SET order_status = ?, delivered_at = CASE WHEN ? = 'delivered' THEN datetime('now') ELSE delivered_at END WHERE id = ?").bind(status, status, id).run();
    }
    return Response.json(await getAdminOrderById(env.DB, Number(id)));
  } catch (error) { return errorResponse(error); }
}
