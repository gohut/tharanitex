import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, getAdminOrderById } from "@/lib/db/order";
import { requireAdmin, errorResponse } from "@/lib/order-access";
import { refundRazorpayPayment } from "@/lib/razorpay";

const FLOW = ["placed", "confirmed", "packed", "shipped", "delivered"];

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await requireAdmin(request, env);
    const { id } = await params;
    const order = await getAdminOrderById(env.DB, Number(id));
    if (!order) throw new CheckoutError("Order not found.", 404);
    return Response.json(order);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const admin = await requireAdmin(request, env);
    const { id } = await params;
    const body = await request.json();
    const order = await getAdminOrderById(env.DB, Number(id));
    if (!order) throw new CheckoutError("Order not found.", 404);

    const isCancellationAction =
      body.action === "cancellation" || body.cancellationAction !== undefined;

    if (isCancellationAction) {
      if (order.cancellation_status !== "REQUESTED") {
        throw new CheckoutError("No pending cancellation request.", 409);
      }

      const decision = String(body.decision || body.cancellationAction || "").toUpperCase();
      const isApproved = decision === "APPROVED" || decision === "APPROVE";
      const isRejected = decision === "REJECTED" || decision === "REJECT";

      if (!isApproved && !isRejected) {
        throw new CheckoutError("Invalid cancellation decision.");
      }

      if (isApproved) {
        const isOnlinePaid =
          order.payment_method?.toUpperCase() !== "COD" &&
          (order.payment_status === "paid" || Boolean(order.razorpay_payment_id));

        let refundId = order.refund_id || null;
        let refundStatus = order.refund_status || "NOT_REQUESTED";

        if (isOnlinePaid && order.razorpay_payment_id && refundStatus !== "COMPLETED") {
          try {
            const amountPaise = Math.round(Number(order.total_amount) * 100);
            const refundData = await refundRazorpayPayment(env, order.razorpay_payment_id, {
              amount: amountPaise,
              notes: { order_id: String(order.id), cancelled_by: String(admin.userId) },
            });
            refundId = refundData.id;
            refundStatus = "COMPLETED";
          } catch (refundErr) {
            console.error("Razorpay refund processing failed:", refundErr);
            await env.DB.prepare(
              "UPDATE orders SET refund_status = 'FAILED', refund_failure_reason = ? WHERE id = ?"
            )
              .bind(refundErr.message || "Razorpay API refund failure", id)
              .run()
              .catch(() => {});

            throw new CheckoutError(
              `Cancellation could not be completed because the refund failed: ${refundErr.message}`,
              400
            );
          }
        } else if (!isOnlinePaid) {
          refundStatus = "NOT_APPLICABLE";
        }

        await env.DB.prepare(`
          UPDATE orders SET 
            cancellation_status = 'APPROVED',
            cancellation_decided_at = datetime('now'),
            cancelled_at = datetime('now'),
            cancelled_by = ?,
            order_status = 'cancelled',
            payment_status = CASE WHEN ? = 'COMPLETED' THEN 'refunded' ELSE payment_status END,
            refund_status = ?,
            refund_id = COALESCE(?, refund_id),
            refund_amount = CASE WHEN ? = 'COMPLETED' THEN ? ELSE refund_amount END,
            refund_completed_at = CASE WHEN ? = 'COMPLETED' THEN datetime('now') ELSE refund_completed_at END
          WHERE id = ?
        `)
          .bind(
            String(admin.userId),
            refundStatus,
            refundStatus,
            refundId,
            refundStatus,
            Number(order.total_amount),
            refundStatus,
            id
          )
          .run();
      } else {
        await env.DB.prepare(
          "UPDATE orders SET cancellation_status = 'REJECTED', cancellation_decided_at = datetime('now') WHERE id = ?"
        )
          .bind(id)
          .run();
      }
    } else {
      const status = String(body.status || "").toLowerCase();
      const current =
        String(order.order_status).toLowerCase() === "processing"
          ? "confirmed"
          : String(order.order_status).toLowerCase();
      if (!FLOW.includes(status)) throw new CheckoutError("Invalid order status.");
      if (current === "cancelled" || FLOW.indexOf(status) !== FLOW.indexOf(current) + 1)
        throw new CheckoutError("Invalid order status transition.", 409);
      await env.DB.prepare(
        "UPDATE orders SET order_status = ?, delivered_at = CASE WHEN ? = 'delivered' THEN datetime('now') ELSE delivered_at END WHERE id = ?"
      )
        .bind(status, status, id)
        .run();
    }
    return Response.json(await getAdminOrderById(env.DB, Number(id)));
  } catch (error) {
    return errorResponse(error);
  }
}
