"use client";

import { useEffect, useMemo, useState } from "react";
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
  Save,
  Truck,
  XCircle,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import FormInput from "../../../../components/ui/FormInput";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { orders as initialOrders } from "../../../../data/orders";
import { products as catalogProducts } from "../../../../data/products";

const ORDERS_STORAGE_KEY = "tharani-admin-orders";
const PROCESS_STEPS = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
const PAYMENT_OPTIONS = ["Pending", "Paid", "Refunded", "Failed"];

const stepIcons = {
  Placed: Package,
  Confirmed: Check,
  Packed: Package,
  Shipped: Truck,
  Delivered: Check,
  Cancelled: XCircle,
  Returned: RotateCcw,
  "Return Initiated": RotateCcw,
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getCatalogProduct = (item) =>
  catalogProducts.find((product) => product.name === item.name);

const hydrateOrder = (order) => {
  if (!order) return null;
  const status = order.status === "Pending" ? "Placed" : order.status;

  return {
    ...order,
    status,
    estimatedDelivery: order.estimatedDelivery || "",
    items: order.items.map((item) => {
      const product = getCatalogProduct(item);
      return {
        ...item,
        image: item.image || product?.image || "https://placehold.co/160x160/145C3E/D4AF37?text=TT",
      };
    }),
  };
};

const loadOrders = () => {
  try {
    const savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "null");
    return Array.isArray(savedOrders) ? savedOrders : initialOrders;
  } catch {
    return initialOrders;
  }
};

const buildTimeline = (status, previousTimeline = []) => {
  if (status === "Cancelled") {
    const timeline = previousTimeline.filter((step) => step !== "Cancelled");
    return [...timeline, "Cancelled"];
  }

  if (status === "Returned") {
    return previousTimeline.length ? previousTimeline : ["Placed", "Confirmed", "Packed", "Shipped", "Delivered", "Returned"];
  }

  const currentIndex = PROCESS_STEPS.indexOf(status);
  return currentIndex >= 0 ? PROCESS_STEPS.slice(0, currentIndex + 1) : previousTimeline;
};

const formatDate = (date) => {
  if (!date) return "Not set";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = decodeURIComponent(String(params?.id || ""));
  const [order, setOrder] = useState(() => hydrateOrder(initialOrders.find((item) => item.id === orderId)));
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedOrder = loadOrders().find((item) => item.id === orderId);
    setOrder(hydrateOrder(storedOrder));
  }, [orderId]);

  const subtotal = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.price * item.qty, 0) || 0,
    [order]
  );

  const isClosed = order ? ["Cancelled", "Returned"].includes(order.status) : false;
  const canCancel = order ? !["Delivered", "Cancelled", "Returned"].includes(order.status) : false;
  const processOptions = PROCESS_STEPS.includes(order?.status) ? PROCESS_STEPS : [order?.status, ...PROCESS_STEPS].filter(Boolean);

  const saveOrder = (nextOrder) => {
    const hydrated = hydrateOrder(nextOrder);
    const updatedOrders = loadOrders().map((item) => (item.id === hydrated.id ? hydrated : item));

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    setOrder(hydrated);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const updateProcess = (status) => {
    saveOrder({
      ...order,
      status,
      timeline: buildTimeline(status, order.timeline),
    });
  };

  const cancelOrder = () => {
    if (!cancelReason.trim()) return;

    saveOrder({
      ...order,
      status: "Cancelled",
      payment: order.payment === "Paid" ? "Refunded" : order.payment,
      cancellationReason: cancelReason.trim(),
      timeline: buildTimeline("Cancelled", order.timeline),
    });
    setShowCancel(false);
  };

  const downloadPdf = () => {
    const printable = window.open("", "_blank", "width=900,height=700");
    if (!printable) return;

    const rows = order.items
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.qty}</td>
            <td>Rs. ${item.price.toLocaleString()}</td>
            <td>Rs. ${(item.price * item.qty).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(order.id)} PDF</title>
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
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Tharani Textiles</h1>
          <p class="muted">Order summary for ${escapeHtml(order.id)}</p>
          <div class="grid">
            <div class="box">
              <strong>Customer</strong>
              <p>${escapeHtml(order.customer)}</p>
              <p>${escapeHtml(order.email)}</p>
              <p>${escapeHtml(order.phone)}</p>
              <p>${escapeHtml(order.address)}</p>
            </div>
            <div class="box">
              <strong>Order</strong>
              <p>Date: ${escapeHtml(order.date)}</p>
              <p>Process: ${escapeHtml(order.status)}</p>
              <p>Payment: ${escapeHtml(order.payment)}</p>
              <p>Estimated delivery: ${escapeHtml(formatDate(order.estimatedDelivery))}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="total">Total: Rs. ${order.total.toLocaleString()}</p>
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

  if (!order) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft size={15} /> Back to Orders
        </Button>
        <div className="bg-green-900 border border-green-800 rounded-2xl p-8 text-center shadow-card">
          <p className="text-white font-semibold">Order not found</p>
          <p className="text-green-400 text-sm mt-1">{orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")} className="w-fit">
            <ArrowLeft size={15} /> Orders
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-white text-2xl font-bold">{order.id}</h1>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment} />
            </div>
            <p className="text-green-400 text-sm mt-0.5">{order.customer} - {order.date}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-700 bg-green-900 px-3 py-2 text-xs font-medium text-green-300">
              <Save size={13} /> Saved
            </span>
          )}
          <Button onClick={downloadPdf}>
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
        <div className="space-y-5">
          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Order Timeline</p>
                <p className="text-white font-semibold mt-1">{order.status}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <FormInput
                  label="Order Process"
                  id="process"
                  type="select"
                  value={PROCESS_STEPS.includes(order.status) ? order.status : processOptions[0]}
                  onChange={(event) => updateProcess(event.target.value)}
                  options={processOptions}
                  disabled={isClosed}
                  className="min-w-44"
                />
                <FormInput
                  label="Estimated Delivery"
                  id="estimatedDelivery"
                  type="date"
                  value={order.estimatedDelivery}
                  onChange={(event) => saveOrder({ ...order, estimatedDelivery: event.target.value })}
                  className="min-w-48"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {PROCESS_STEPS.map((step) => {
                const Icon = stepIcons[step] || Package;
                const done = order.timeline.includes(step);
                const current = order.status === step;

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
                        <p className="text-[11px] text-green-500">{done ? "Complete" : "Waiting"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Items</p>
                <h2 className="text-white font-semibold mt-1">{order.items.length} item{order.items.length > 1 ? "s" : ""}</h2>
              </div>
              <p className="text-gold-400 text-lg font-bold">Rs. {order.total.toLocaleString()}</p>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {order.items.map((item) => (
                <article key={`${item.name}-${item.qty}`} className="flex gap-3 rounded-xl border border-green-800 bg-green-950/35 p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg border border-green-800 object-cover bg-green-900"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold leading-snug">{item.name}</p>
                    <p className="text-green-400 text-xs mt-1">Qty {item.qty}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-green-300 text-xs">Rs. {item.price.toLocaleString()} each</p>
                      <p className="text-gold-400 text-sm font-bold">Rs. {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 border-t border-green-800 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Subtotal</span>
                <span className="text-white font-medium">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Shipping</span>
                <span className="text-green-300">Included</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base">
                <span className="text-white font-semibold">Total</span>
                <span className="text-gold-400 font-bold">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Customer</p>
            <h2 className="text-white font-semibold mt-2">{order.customer}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex gap-2 text-green-300"><Mail size={14} className="mt-0.5 shrink-0" /> {order.email}</p>
              <p className="flex gap-2 text-green-300"><Phone size={14} className="mt-0.5 shrink-0" /> {order.phone}</p>
              <p className="flex gap-2 text-green-300"><MapPin size={14} className="mt-0.5 shrink-0" /> {order.address}</p>
            </div>
          </section>

          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Shipping</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Truck size={15} className="mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">{order.courier}</p>
                  <p className="text-green-400 text-xs">{order.trackingId}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CalendarDays size={15} className="mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">{formatDate(order.estimatedDelivery)}</p>
                  <p className="text-green-400 text-xs">Estimated delivery</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Payment</p>
            <div className="mt-3">
              <FormInput
                label="Payment Status"
                id="payment"
                type="select"
                value={order.payment}
                onChange={(event) => saveOrder({ ...order, payment: event.target.value })}
                options={PAYMENT_OPTIONS}
              />
            </div>
          </section>

          <section className="bg-green-900 border border-green-800 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Cancellation</p>
                <p className="text-white text-sm font-semibold mt-1">{order.status === "Cancelled" ? "Cancelled" : "Available"}</p>
              </div>
              {canCancel && (
                <Button variant="danger" size="sm" onClick={() => setShowCancel((value) => !value)}>
                  <XCircle size={14} /> Cancel
                </Button>
              )}
            </div>

            {order.cancellationReason && (
              <p className="mt-3 rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {order.cancellationReason}
              </p>
            )}

            {!canCancel && !order.cancellationReason && (
              <p className="mt-3 text-sm text-green-400">
                {isClosed ? "This order is closed." : "Delivered orders are closed."}
              </p>
            )}

            {showCancel && canCancel && (
              <div className="mt-4 space-y-3">
                <FormInput
                  label="Reason"
                  id="cancelReason"
                  type="textarea"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowCancel(false)}>Back</Button>
                  <Button variant="danger" size="sm" disabled={!cancelReason.trim()} onClick={cancelOrder}>
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
