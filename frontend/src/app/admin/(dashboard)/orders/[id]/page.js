"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Truck,
  XCircle,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

const PROCESS_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

const stepIcons = {
  Placed: Package,
  Processing: RefreshCw,
  Shipped: Truck,
  Delivered: Check,
  Cancelled: XCircle,
  Returned: RotateCcw,
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = decodeURIComponent(String(params?.id || ""));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Order not found");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Order not found");
        }
        const data = await res.json();
        if (!ignore) {
          setOrder(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load order");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus.toLowerCase() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Status update failed");
      await fetchOrder();
    } catch (err) {
      setError(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const executeApproveCancellation = async () => {
    if (approving || updating) return;
    setApproving(true);
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancellation",
          decision: "APPROVED",
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Cancellation action failed");
      setCancellationReason("");
      setShowApproveModal(false);
      await fetchOrder();
    } catch (err) {
      setError(err.message || "Cancellation action failed");
    } finally {
      setApproving(false);
      setUpdating(false);
    }
  };

  const handleRejectCancellation = async () => {
    if (updating) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancellation",
          decision: "REJECTED",
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Cancellation action failed");
      setCancellationReason("");
      await fetchOrder();
    } catch (err) {
      setError(err.message || "Cancellation action failed");
    } finally {
      setUpdating(false);
    }
  };

  const downloadPdf = () => {
    if (!order) return;
    const printable = window.open("", "_blank", "width=900,height=700");
    if (!printable) return;

    const rows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name || item.product_name)}</td>
            <td>${item.quantity}</td>
            <td>Rs. ${Number(item.price).toLocaleString()}</td>
            <td>Rs. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Order #${escapeHtml(order.id)} PDF</title>
          <style>
            body { color: #10251c; font-family: Arial, sans-serif; margin: 36px; }
            h1 { margin: 0 0 4px; }
            .muted { color: #567264; font-size: 13px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 26px 0; }
            .box { border: 1px solid #c8d8d0; border-radius: 10px; padding: 16px; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            th, td { border-bottom: 1px solid #d9e4df; padding: 10px; text-align: left; }
            th { color: #315c49; font-size: 12px; text-transform: uppercase; }
            .total { color: #8c6b12; font-size: 22px; font-weight: 700; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Tharani Textiles</h1>
          <p class="muted">Order summary for #${escapeHtml(order.id)}</p>
          <div class="grid">
            <div class="box">
              <strong>Customer Information</strong>
              <p>${escapeHtml(order.full_name)}</p>
              <p>${escapeHtml(order.phone)}</p>
              <p>${escapeHtml(order.address_line1)}</p>
              <p>${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}</p>
            </div>
            <div class="box">
              <strong>Order Information</strong>
              <p>Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}</p>
              <p>Status: ${escapeHtml(order.order_status)}</p>
              <p>Payment: ${escapeHtml(order.payment_method)} (${escapeHtml(order.payment_status)})</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="total">Total: Rs. ${Number(order.total_amount).toLocaleString()}</p>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printable.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft size={15} /> Back to Orders
        </Button>
        <div className="bg-green-900 border border-green-800 rounded-2xl p-12 text-center text-green-300 animate-pulse shadow-card">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft size={15} /> Back to Orders
        </Button>
        <div className="bg-green-900 border border-green-800 rounded-2xl p-8 text-center shadow-card">
          <p className="text-white font-semibold">{error || "Order not found"}</p>
          <p className="text-green-400 text-sm mt-1">#{orderId}</p>
        </div>
      </div>
    );
  }

  const currentStatus = (order.order_status || "placed").toLowerCase();
  const currentStatusCap = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
  const isClosed = ["cancelled", "delivered"].includes(currentStatus);
  const items = order.items || [];
  const totalAmount = Number(order.total_amount || 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")} className="w-fit">
            <ArrowLeft size={15} /> Orders
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-white text-2xl font-bold">#{order.id}</h1>
              <StatusBadge status={currentStatusCap} />
              <StatusBadge status={(order.payment_status || "pending").charAt(0).toUpperCase() + (order.payment_status || "pending").slice(1)} />
            </div>
            <p className="text-green-400 text-sm mt-0.5">
              {order.full_name} &bull; {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={fetchOrder} disabled={updating}>
            <RefreshCw size={14} className={updating ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button onClick={downloadPdf}>
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
        <div className="space-y-5">
          {/* Order Lifecycle Control */}
          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Order Process Lifecycle</p>
                <p className="text-white font-semibold mt-1">Current Status: {currentStatusCap}</p>
              </div>

              {!isClosed && (
                <div className="flex flex-wrap gap-2">
                  {(currentStatus === "placed" || currentStatus === "confirmed") && (
                    <button
                      onClick={() => handleStatusUpdate("processing")}
                      disabled={updating}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      Process Order
                    </button>
                  )}
                  {(currentStatus === "processing" || currentStatus === "packed") && (
                    <button
                      onClick={() => handleStatusUpdate("shipped")}
                      disabled={updating}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {currentStatus === "shipped" && (
                    <button
                      onClick={() => handleStatusUpdate("delivered")}
                      disabled={updating}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {PROCESS_STEPS.map((step) => {
                const Icon = stepIcons[step] || Package;
                const stepLower = step.toLowerCase();
                const stages = ["placed", "processing", "shipped", "delivered"];
                // Handle legacy confirmed/packed status values if present in older DB rows
                let effectiveStatus = currentStatus;
                if (effectiveStatus === "confirmed" || effectiveStatus === "packed") {
                  effectiveStatus = "processing";
                }
                const currentIdx = stages.indexOf(effectiveStatus);
                const stepIdx = stages.indexOf(stepLower);
                const done = currentStatus !== "cancelled" && stepIdx <= currentIdx;
                const current = effectiveStatus === stepLower;

                return (
                  <div
                    key={step}
                    className={`rounded-xl border px-3 py-3 ${
                      current
                        ? "border-gold-600 bg-gold-900/20"
                        : done
                          ? "border-green-600 bg-green-800/50"
                          : "border-green-800 bg-green-950/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        current ? "bg-gold-600 text-green-950" : done ? "bg-green-700 text-green-100" : "bg-green-900 text-green-500"
                      }`}>
                        <Icon size={15} />
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${current ? "text-gold-300" : done ? "text-white" : "text-green-500"}`}>
                          {step}
                        </p>
                        <p className="text-[11px] text-green-500">{done ? "Complete" : "Pending"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer Cancellation Request Review */}
          {order.cancellation_status && order.cancellation_status !== "NONE" && (
            <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Customer Cancellation Request</p>
                  <h2 className="text-white font-semibold mt-1">Status: <span className="text-gold-400 uppercase">{order.cancellation_status}</span></h2>
                </div>
                <AlertTriangle size={20} className="text-gold-400" />
              </div>

              <div className="mt-3 text-sm text-green-200 space-y-1 bg-green-950/40 p-3 rounded-xl border border-green-800">
                {order.cancellation_reason && <p><strong className="text-white">Customer Reason:</strong> {order.cancellation_reason}</p>}
                {order.cancellation_requested_at && <p className="text-xs text-green-400">Requested At: {new Date(order.cancellation_requested_at).toLocaleString("en-IN")}</p>}
                {order.refund_status && order.refund_status !== "NOT_REQUESTED" && (
                  <div className="mt-2 pt-2 border-t border-green-800 text-xs space-y-1">
                    <p><strong className="text-white">Refund Status:</strong> <span className="text-gold-400 font-semibold">{order.refund_status}</span></p>
                    {order.refund_id && <p className="text-green-300">Refund ID: {order.refund_id}</p>}
                    {order.refund_failure_reason && <p className="text-red-400 mt-1 font-mono text-[11px]">Error: {order.refund_failure_reason}</p>}
                  </div>
                )}
              </div>

              {order.cancellation_status === "REQUESTED" && (
                <div className="mt-4 space-y-3 pt-3 border-t border-green-800">
                  <textarea
                    placeholder="Optional admin note / reason for decision..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={2}
                    className="w-full bg-green-950/60 border border-green-700 rounded-xl p-3 text-xs text-white placeholder-green-500 focus:outline-none focus:border-gold-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={updating || approving}
                      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      Approve Cancellation
                    </button>
                    <button
                      onClick={handleRejectCancellation}
                      disabled={updating || approving}
                      className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Items Section */}
          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Order Items</p>
                <h2 className="text-white font-semibold mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</h2>
              </div>
              <p className="text-gold-400 text-lg font-bold">Rs. {totalAmount.toLocaleString()}</p>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {items.map((item) => (
                <article key={`${item.id}-${item.product_id}`} className="flex gap-3 rounded-xl border border-green-800 bg-green-950/35 p-3">
                  <img
                    src={item.image || "/assets/product1.png"}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg border border-green-800 object-cover bg-green-900"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold leading-snug">{item.name}</p>
                    <p className="text-green-400 text-xs mt-1">Qty {item.quantity}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-green-300 text-xs">Rs. {Number(item.price).toLocaleString()} each</p>
                      <p className="text-gold-400 text-sm font-bold">Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 border-t border-green-800 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Subtotal</span>
                <span className="text-white font-medium">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Shipping</span>
                <span className="text-green-300">Free</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base">
                <span className="text-white font-semibold">Total</span>
                <span className="text-gold-400 font-bold">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Customer Details</p>
            <h2 className="text-white font-semibold mt-2">{order.full_name}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex gap-2 text-green-300"><Phone size={14} className="mt-0.5 shrink-0" /> {order.phone}</p>
              <p className="flex gap-2 text-green-300"><MapPin size={14} className="mt-0.5 shrink-0" /> {order.address_line1}, {order.city}, {order.state} - {order.pincode}</p>
            </div>
          </section>

          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Payment Details</p>
            <div className="mt-3 text-sm space-y-1.5 text-green-300">
              <p>Method: <strong className="text-white">{order.payment_method}</strong></p>
              <p>Status: <strong className="text-gold-400 uppercase">{order.payment_status}</strong></p>
              {order.razorpay_order_id && <p className="text-xs">Razorpay Order: {order.razorpay_order_id}</p>}
              {order.razorpay_payment_id && <p className="text-xs">Razorpay Payment: {order.razorpay_payment_id}</p>}
              {order.paid_at && <p className="text-xs">Paid At: {new Date(order.paid_at).toLocaleString("en-IN")}</p>}
            </div>
          </section>
        </aside>
      </div>

      {/* Cancellation Approval Confirmation Modal */}
      {showApproveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-green-700 bg-green-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/80 border border-red-800 text-red-400">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h3 id="approve-modal-title" className="text-lg font-bold text-white">
                    Approve Cancellation
                  </h3>
                  <p className="text-xs text-green-400 font-medium">
                    Order #{order.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !approving && setShowApproveModal(false)}
                disabled={approving}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-green-400 hover:bg-green-800 hover:text-white transition disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-green-200">
              Are you sure you want to approve this cancellation and refund{" "}
              <strong className="text-gold-300 font-semibold">
                Rs. {totalAmount.toLocaleString()}
              </strong>{" "}
              to the customer's original payment method?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={approving}
                className="px-4 py-2.5 rounded-xl border border-green-700 bg-green-950/60 text-xs font-semibold text-green-300 hover:bg-green-800 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeApproveCancellation}
                disabled={approving || updating}
                className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Approve & Refund</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
