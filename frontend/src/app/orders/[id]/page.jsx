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
import { getOrderById } from "@/data/customerOrders";

export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  const order = getOrderById(resolvedParams.id);

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

            <div className="mt-8 grid gap-6 border-b border-[#DDCFBD] pb-8 md:grid-cols-[140px_1fr_auto] md:items-center">
              <img
                src={order.image}
                alt={order.productName}
                className="h-[154px] w-[122px] object-cover"
              />

              <div>
                <h3 className="text-[26px] font-semibold text-[#211D19]">
                  {order.productName}
                </h3>
                <p className="mt-2 text-[18px] font-semibold text-[#6C6258]">
                  {order.variant}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
                  <span>Qty : {order.quantity}</span>
                  <span>{order.itemPrice}</span>
                </div>
              </div>

              <button className="inline-flex items-center justify-center gap-3 border border-[#CDBCA2] px-6 py-4 text-[17px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]">
                <ShoppingBag size={20} />
                <span>Buy Again</span>
              </button>
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
          </section>

          <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
            <h2 className="text-[22px] font-semibold text-[#201C18]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-6">
              <SummaryRow
                label="Subtotal(1 Item)"
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
