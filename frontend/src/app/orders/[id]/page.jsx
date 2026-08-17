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
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getOrderById as getMockOrderById } from "@/data/customerOrders";
import { getOrderById as getDatabaseOrderById } from "@/lib/db/order";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  let databaseOrder = null;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value || "";
    const user = await validateSession(token, env);
    const userId = user?.userType === "customer" ? String(user.userId) : "1";
    databaseOrder = await getDatabaseOrderById(env.DB, resolvedParams.id, userId);
  } catch (error) {
    console.error("Order details error:", error);
  }

  // Retain the existing static order examples when an older demo order URL is
  // opened, while newly created checkout orders come from the database.
  const order = databaseOrder
    ? mapDatabaseOrder(databaseOrder)
    : getMockOrderById(resolvedParams.id);

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
              The requested order could not be located.
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
              {displayItems.map((item) => <div key={item.id} className="grid gap-6 md:grid-cols-[140px_1fr_auto] md:items-center">
                <img src={item.image} alt={item.name} className="h-[154px] w-[122px] object-cover" />
                <div><h3 className="text-[26px] font-semibold text-[#211D19]">{item.name}</h3><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]"><span>Qty : {item.quantity}</span><span>{typeof item.price === "number" ? formatPrice(item.price) : item.price}</span></div></div>
                {item.slug ? <Link href={`/product/${item.slug}`} className="inline-flex items-center justify-center gap-3 border border-[#CDBCA2] px-6 py-4 text-[17px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]"><ShoppingBag size={20} /><span>Buy Again</span></Link> : null}
              </div>)}
            </div>

            <div className="mx-auto mt-10 max-w-[430px]">
              <OrderTimeline steps={order.trackingSteps} />
            </div>
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <div className="flex flex-col gap-4 border-b border-[#DDCFBD] pb-5 text-sm text-[#8A8175] md:flex-row md:items-center md:justify-between">
              <p>{order.placedOn}</p>
              <OrderStatusPill status={order.status} />
            </div>

            <div className="grid gap-8 pt-7 md:grid-cols-[220px_1fr]">
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
  const status = order.order_status || "placed";

  return {
    items: (order.items || []).map((item) => ({ ...item, id: item.id || item.product_id })),
    placedOn: `Placed On ${date}`,
    status: `${status.charAt(0).toUpperCase()}${status.slice(1)}`,
    trackingSteps: buildTrackingSteps(status, date),
    shippingAddress: {
      lines: order.address_line1.split(/\n|,/).map((line) => line.trim()).filter(Boolean),
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
  const completedIndex = status === "cancelled" ? 0 : Math.max(0, stages.indexOf(status));
  const timelineStages = status === "cancelled" ? ["placed", "cancelled"] : stages;

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
