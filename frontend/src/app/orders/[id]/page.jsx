import Link from "next/link";
import { ChevronRight, Headphones, Phone, ShoppingBag } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Navbar from "@/components/home/Navbar/Navbar";
import CustomerPageHeader from "@/components/orders/CustomerPageHeader";
import OrderStatusPill from "@/components/orders/OrderStatusPill";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { getOrderById } from "@/lib/db/order";

export const dynamic = "force-dynamic";

const formatPrice = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDate = (value, options = { day: "numeric", month: "long", year: "numeric" }) => new Date(value).toLocaleDateString("en-IN", options);

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;
  let order = null;
  try {
    const { env } = await getCloudflareContext({ async: true });
    order = await getOrderById(env.DB, id, 1);
  } catch (error) {
    console.error("Order details error:", error);
  }

  if (!order) return <OrderNotFound />;

  const status = `${order.order_status?.charAt(0).toUpperCase()}${order.order_status?.slice(1)}`;
  const totalQuantity = order.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const trackingSteps = buildTrackingSteps(order.order_status, order.created_at);
  const addressLines = order.address_line1.split(/\n|,/).map((line) => line.trim()).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 md:px-8 md:pt-12 lg:px-10">
        <CustomerPageHeader title="My Orders" description="Track and manage your orders" />
        <div className="mt-10 space-y-5">
          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <div className="flex items-start justify-between"><h2 className="text-[22px] font-semibold text-[#201C18]">Order Items</h2><ShoppingBag size={22} className="text-[#201C18]" /></div>
            <div className="mt-7 space-y-6 border-b border-[#DDCFBD] pb-8">
              {order.items.map((item) => <div key={item.id} className="grid gap-5 sm:grid-cols-[112px_1fr_auto] sm:items-center">
                {item.image ? <img src={item.image} alt={item.name} className="h-[140px] w-[112px] object-cover" /> : <div className="flex h-[140px] w-[112px] items-center justify-center bg-[#F1E7D8] text-xs text-[#9A8B78]">No Image</div>}
                <div><h3 className="text-xl font-semibold text-[#211D19] sm:text-2xl">{item.name}</h3><p className="mt-3 text-sm font-medium text-[#8A8175]">Qty: {item.quantity}</p></div>
                <p className="text-lg font-semibold text-[#211D19]">{formatPrice(Number(item.price) * Number(item.quantity))}</p>
              </div>)}
            </div>
            <div className="mx-auto mt-10 max-w-[430px]"><OrderTimeline steps={trackingSteps} /></div>
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <div className="flex flex-col gap-4 border-b border-[#DDCFBD] pb-5 text-sm text-[#8A8175] md:flex-row md:items-center md:justify-between"><p>Placed on {formatDate(order.created_at)}</p><OrderStatusPill status={status} /></div>
            <DetailsRow title="Shipping Address"><div className="text-[18px] leading-8 text-[#211D19]"><p className="font-medium">{order.full_name}</p>{addressLines.map((line) => <p key={line}>{line}</p>)}</div></DetailsRow>
            <DetailsRow title="Contact Number"><div className="flex items-center gap-4 text-[18px] text-[#211D19]"><Phone size={20} className="text-[#7D7267]" /><span>{order.phone}</span></div></DetailsRow>
            <DetailsRow title="Payment"><div className="text-[18px] text-[#211D19]"><p>{order.payment_method || "COD"}</p><p className="mt-1 text-sm capitalize text-[#7D7267]">Payment status: {order.payment_status}</p></div></DetailsRow>
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8"><h2 className="text-[22px] font-semibold text-[#201C18]">Order Summary</h2><div className="mt-6 space-y-5"><SummaryRow label={`Subtotal (${totalQuantity} item${totalQuantity !== 1 ? "s" : ""})`} value={formatPrice(order.total_amount)} /><SummaryRow label="Shipping" value="Free" /></div><div className="mt-6 flex items-center justify-between border-t border-[#DDCFBD] pt-5 text-[20px] font-semibold text-[#201C18]"><span>Total</span><span>{formatPrice(order.total_amount)}</span></div></section>
          <section className="border border-[#DDCFBD] bg-[#FCF7EF]"><Link href="/contact" className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#FFF8EB]"><span className="flex items-center gap-4 text-[20px] font-medium text-[#201C18]"><Headphones size={26} className="text-[#7D7267]" />Need Help?</span><ChevronRight size={28} className="text-[#7D7267]" /></Link></section>
        </div>
      </section>
    </main>
  );
}

function buildTrackingSteps(status, createdAt) {
  const stages = ["placed", "processing", "shipped", "delivered"];
  const isCancelled = status === "cancelled";
  const completedIndex = isCancelled ? 0 : Math.max(0, stages.indexOf(status));
  const date = formatDate(createdAt, { day: "numeric", month: "short", year: "numeric" });
  return (isCancelled ? ["placed", "cancelled"] : stages).map((stage, index) => ({ id: stage, title: stage === "placed" ? "Order Placed" : stage.charAt(0).toUpperCase() + stage.slice(1), timestamp: index <= completedIndex ? date : "Pending", complete: index <= completedIndex }));
}

function DetailsRow({ title, children }) { return <div className="grid gap-4 border-b border-[#E7DAC8] py-7 last:border-0 md:grid-cols-[220px_1fr]"><h3 className="text-[20px] font-semibold text-[#211D19]">{title}</h3>{children}</div>; }
function SummaryRow({ label, value }) { return <div className="flex items-center justify-between gap-4 text-[18px]"><span className="font-semibold text-[#6C6258]">{label}</span><span className="text-[#585046]">{value}</span></div>; }

function OrderNotFound() { return <main className="min-h-screen bg-[#FBF5EA]"><Navbar /><section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 lg:px-10"><CustomerPageHeader title="My Orders" description="Track and manage your orders" /><div className="mt-10 border border-[#DDCFBD] bg-[#FCF7EF] px-6 py-16 text-center"><p className="font-klaristha text-[36px] uppercase text-[#D39A2F]">Order Not Found</p><p className="mt-4 text-[#7D7267]">The requested order could not be located.</p><Link href="/orders" className="mt-8 inline-flex border border-[#CDBCA2] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]">Back to Orders</Link></div></section></main>; }
