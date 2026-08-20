import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckoutError, getOrderById } from "@/lib/db/order";
import { requireCustomer } from "@/lib/checkout-auth";
import { errorResponse } from "@/lib/order-access";

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

export async function GET(request, { params }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const customerId = await requireCustomer(request, env);
    const { id } = await params;
    const order = await getOrderById(env.DB, Number(id), customerId);
    if (!order) throw new CheckoutError("Order not found.", 404);
    if (String(order.order_status).toLowerCase() !== "delivered") throw new CheckoutError("Invoice is available after delivery.", 409);
    const invoiceNumber = order.invoice_number || `TT-${String(order.id).padStart(6, "0")}`;
    if (!order.invoice_number) await env.DB.prepare("UPDATE orders SET invoice_number = ? WHERE id = ? AND user_id = ?").bind(invoiceNumber, id, customerId).run();
    const rows = order.items.map((item) => `<tr><td>${escape(item.name)}</td><td>${item.quantity}</td><td>Rs. ${Number(item.price).toFixed(2)}</td><td>Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${invoiceNumber}</title><style>body{font:14px Arial;color:#17251d;margin:40px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:18px;font-weight:bold}</style></head><body><h1>Tharani Textiles</h1><p>Invoice: ${escape(invoiceNumber)}<br>Order: #${escape(order.id)}<br>Order date: ${escape(order.created_at)}<br>Delivered: ${escape(order.delivered_at || "Delivered")}</p><h3>Customer</h3><p>${escape(order.full_name)}<br>${escape(order.phone)}<br>${escape([order.address_line1, order.address_line2, order.city, order.state, order.pincode].filter(Boolean).join(", "))}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Total: Rs. ${Number(order.total_amount).toFixed(2)}</p><p>Payment: ${escape(order.payment_method)} (${escape(order.payment_status)})</p></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="invoice-${invoiceNumber}.html"` } });
  } catch (error) { return errorResponse(error, "Unable to generate invoice."); }
}
