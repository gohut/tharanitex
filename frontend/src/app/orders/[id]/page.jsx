 import Link from "next/link";
import {
  ChevronRight,
  Headphones,
  Phone,
  ShoppingBag,
} from "lucide-react";
import Navbar from "@/components/home/Navbar/Navbar";
import CustomerPageHeader from "@/components/orders/CustomerPageHeader";
import OrderStatusPill from "@/components/orders/OrderStatusPill";
import OrderTimeline from "@/components/orders/OrderTimeline";
import CustomerOrderActions from "@/components/orders/CustomerOrderActions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getOrderById as getDatabaseOrderById } from "@/lib/db/order";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { verifyJWT } from "@/utils/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  let databaseOrder = null;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const cookieStore = await cookies();
    let userId = null;

    // 1. Try JWT authentication (auth_token or token)
    const jwtToken = cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value;
    if (jwtToken) {
      const secret = process.env.JWT_SECRET || "tharanitex_super_secret_key_123!";
      const payload = await verifyJWT(jwtToken, secret);
      if (payload && (payload.role === "customer" || !payload.role) && payload.id) {
        userId = String(payload.id);
      }
    }

    // 2. Fall back to session authentication (tharanitex_session)
    if (!userId) {
      const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value || "";
      if (sessionToken) {
        const user = await validateSession(sessionToken, env);
        if (user?.userType === "customer" && user.userId) {
          userId = String(user.userId);
        }
      }
    }

    if (userId) databaseOrder = await getDatabaseOrderById(env.DB, resolvedParams.id, userId);
  } catch (error) {
    console.error("Order details error:", error);
  }

  const order = databaseOrder ? mapDatabaseOrder(databaseOrder) : null;

  if (!order) {
    return (
      <main className="min-h-screen bg-[#FBF5EA]">
        <Navbar />
        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 lg:px-10">
          <CustomerPageHeader
            title="My Orders"
            description="Track and manage your orders"
          />

          <div className="mt-10 border border-[#DDCFBD] bg-[#FCF7EF] px-6 py-16 text-center">
            <p className="font-klaristha text-[36px] uppercase text-[#D39A2F]">
              Order Not Found
            </p>
            <p className="mt-4 text-[#7D7267]">
              The requested order could not be located or does not belong to your account.
            </p>
            <Link
              href="/orders"
              className="mt-8 inline-flex border border-[#CDBCA2] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]"
            >
              Back to Orders
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const displayItems = order.items || [{ id: order.productName, image: order.image, name: order.productName, quantity: order.quantity, price: order.itemPrice, slug: "" }];

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 md:px-8 md:pt-12 lg:px-10">
        <CustomerPageHeader
          title="My Orders"
          description="Track and manage your orders"
        />

        <div className="mt-10 space-y-5">
          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <div className="flex items-start justify-between">
              <h2 className="text-[22px] font-semibold text-[#201C18]">
                Order Items
              </h2>
              <ShoppingBag
                size={22}
                className="text-[#201C18]"
              />
            </div>

            <div className="mt-8 space-y-6 border-b border-[#DDCFBD] pb-8">
              {displayItems.map((item) => (
                <div key={item.id} className="grid gap-6 md:grid-cols-[140px_1fr_auto] md:items-center">
                  <img src={item.image} alt={item.name} className="h-[154px] w-[122px] object-cover" />
                  <div>
                    <h3 className="text-[26px] font-semibold text-[#211D19]">{item.name}</h3>
                    {item.variant_name && (
                      <p className="mt-2 text-sm text-[#8A8175]">
                        Variant: {item.variant_name}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
                      <span>Qty : {item.quantity}</span>
                      <span>{typeof item.price === "number" ? formatPrice(item.price) : item.price}</span>
                    </div>
                    {/* Date placed directly below saree name and details */}
                    <p className="mt-2.5 text-sm font-medium text-[#8A8175]">{order.placedOn}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* Status pill placed directly above Buy Again button */}
                    <OrderStatusPill status={order.status} />

                    {item.slug ? (
                      <Link
                        href={`/product/${item.slug}`}
                        className="inline-flex items-center justify-center gap-3 border border-[#CDBCA2] px-6 py-4 text-[17px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]"
                      >
                        <ShoppingBag size={20} />
                        <span>Buy Again</span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-[430px]">
              <OrderTimeline steps={order.trackingSteps} />
            </div>
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <div className="grid gap-8 pt-2 md:grid-cols-[220px_1fr]">
              <h3 className="text-[20px] font-semibold text-[#211D19]">
                Shipping Address
              </h3>

              <div className="text-[18px] leading-10 text-[#211D19]">
                {order.shippingAddress.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-8 pt-10 md:grid-cols-[220px_1fr]">
              <h3 className="text-[20px] font-semibold text-[#211D19]">
                Contact Number
              </h3>

              <div className="flex items-center gap-4 text-[18px] text-[#211D19]">
                <Phone size={20} className="text-[#7D7267]" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </div>

            {order.paymentMethod && (
              <div className="grid gap-8 pt-10 md:grid-cols-[220px_1fr]">
                <h3 className="text-[20px] font-semibold text-[#211D19]">
                  Payment
                </h3>

                <div className="text-[18px] text-[#211D19]">
                  <p>{order.paymentMethod}</p>
                  <p className="mt-1 text-sm capitalize text-[#7D7267]">
                    Payment status: {order.paymentStatus}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Standalone Section Card for Cancellation Request & Tax Invoice */}
          <CustomerOrderActions
            orderId={order.rawId}
            rawStatus={order.rawStatus}
            cancellationStatus={order.cancellationStatus}
            cancellationReason={order.cancellationReason}
            refundStatus={order.refundStatus}
          />

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <h2 className="text-[22px] font-semibold text-[#201C18]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-6">
              <SummaryRow
                label={`Subtotal (${displayItems.length} Item${displayItems.length === 1 ? "" : "s"})`}
                value={order.summary.subtotal}
              />
              <SummaryRow
                label="Shipping"
                value={order.summary.shipping}
              />
              <SummaryRow
                label="Discount"
                value={order.summary.discount}
                valueClassName="text-[#2B8B43]"
              />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#DDCFBD] pt-5">
              <span className="text-[20px] font-semibold text-[#201C18]">
                Total
              </span>
              <span className="text-[20px] font-semibold text-[#201C18]">
                {order.summary.total}
              </span>
            </div>
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF]">
            <Link
              href="/contact"
              className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#FFF8EB]"
            >
              <div className="flex items-center gap-4">
                <Headphones
                  size={26}
                  className="text-[#7D7267]"
                />
                <span className="text-[20px] font-medium text-[#201C18]">
                  Need Help ?
                </span>
              </div>

              <ChevronRight
                size={28}
                className="text-[#7D7267]"
              />
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function mapDatabaseOrder(order) {
  const createdAt = new Date(order.created_at);
  const date = createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const rawStatus = order.order_status || "placed";

  const status =
    rawStatus.toLowerCase() === "confirmed" ||
    rawStatus.toLowerCase() === "packed"
      ? "processing"
      : rawStatus.toLowerCase();

  return {
    rawId: order.id,
    rawStatus: rawStatus,
    cancellationStatus: order.cancellation_status || "NONE",
    cancellationReason: order.cancellation_reason || "",
    refundStatus: order.refund_status || "NOT_REQUESTED",
    items: (order.items || []).map((item) => ({ ...item, id: item.id || item.product_id })),
    placedOn: `Placed On ${date}`,
    status: `${status.charAt(0).toUpperCase()}${status.slice(1)}`,
    trackingSteps: buildTrackingSteps(status, date),
    shippingAddress: {
      lines: (order.address_line1 || "").split(/\n|,/).map((line) => line.trim()).filter(Boolean),
      phone: order.phone,
    },
    summary: {
      subtotal: formatPrice(order.total_amount),
      shipping: "Free",
      discount: "Rs. 0",
      total: formatPrice(order.total_amount),
    },
    paymentMethod: order.payment_method || "COD",
    paymentStatus: order.payment_status || "pending",
  };
}

function buildTrackingSteps(status, date) {
  const stages = ["placed", "processing", "shipped", "delivered"];
  let normalizedStatus = (status || "placed").toLowerCase();
  if (normalizedStatus === "confirmed" || normalizedStatus === "packed") {
    normalizedStatus = "processing";
  }
  const completedIndex = normalizedStatus === "cancelled" ? 0 : Math.max(0, stages.indexOf(normalizedStatus));
  const timelineStages = normalizedStatus === "cancelled" ? ["placed", "cancelled"] : stages;

  return timelineStages.map((stage, index) => ({
    id: stage,
    title: stage === "placed" ? "Order Placed" : `${stage.charAt(0).toUpperCase()}${stage.slice(1)}`,
    timestamp: index <= completedIndex ? date : "Pending",
    complete: index <= completedIndex,
  }));
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function SummaryRow({
  label,
  value,
  valueClassName = "text-[#585046]",
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[18px]">
      <span className="font-semibold text-[#6C6258]">
        {label}
      </span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
