import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import OrderStatusPill from "./OrderStatusPill";

export default function OrderCard({ order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block border border-[#DDCFBD] bg-[#FCF7EF] p-5 transition hover:-translate-y-0.5 hover:shadow-sm md:p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#B5986B]">
            Order ID
          </p>
          <p className="mt-1 text-sm font-semibold text-[#25211C]">
            {order.id}
          </p>
          <p className="mt-2 text-sm text-[#8A8175]">
            Ordered on {order.orderDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusPill status={order.status} />
          <span className="text-sm text-[#8A8175]">
            {order.status === "Cancelled"
              ? order.cancellationLabel
              : order.statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-[#E7DAC8] pt-5 lg:grid-cols-[120px_1fr_auto] lg:items-center">
        <img
          src={order.image}
          alt={order.productName}
          className="h-[140px] w-[120px] object-cover"
        />

        <div>
          <h3 className="text-[26px] font-semibold leading-tight text-[#25211C]">
            {order.productName}
          </h3>
          <p className="mt-2 text-[18px] font-semibold text-[#6C6258]">
            {order.variant}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
            <span>Qty : {order.quantity}</span>
            <span>{order.itemPrice}</span>
            <span>Total : {order.totalAmount}</span>
          </div>
        </div>

        <div className="justify-self-start lg:justify-self-end">
          <div className="inline-flex items-center gap-3 border border-[#CDBCA2] px-6 py-4 text-[17px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]">
            <ShoppingBag size={20} />
            <span>Buy Again</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
