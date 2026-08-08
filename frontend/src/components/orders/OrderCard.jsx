import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import OrderStatusPill from "./OrderStatusPill";

export default function OrderCard({ order }) {
  const firstItem = order.items?.[0];

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const status =
    order.order_status?.charAt(0).toUpperCase() +
    order.order_status?.slice(1);

  const totalQuantity =
    order.items?.reduce(
      (total, item) => total + Number(item.quantity),
      0
    ) || 0;

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
            #{order.id}
          </p>

          <p className="mt-2 text-sm text-[#8A8175]">
            Ordered on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusPill status={status} />

          <span className="text-sm capitalize text-[#8A8175]">
            {order.order_status}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-t border-[#E7DAC8] pt-5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5 lg:mt-6 lg:grid-cols-[120px_1fr_auto] lg:items-center">

        {firstItem?.image ? (
          <img
            src={firstItem.image}
            alt={firstItem.name}
            className="h-[120px] w-[96px] object-cover sm:h-[140px] sm:w-[120px]"
          />
        ) : (
          <div className="flex h-[140px] w-[120px] items-center justify-center bg-[#F1E7D8] text-xs text-[#9A8B78]">
            No Image
          </div>
        )}

        <div>
          <h3 className="line-clamp-2 text-[19px] font-semibold leading-tight text-[#25211C] sm:text-[24px] lg:text-[26px]">
            {firstItem?.name || "Order"}
          </h3>

          {order.items?.length > 1 && (
            <p className="mt-2 text-sm text-[#8A8175]">
              + {order.items.length - 1} more item
              {order.items.length - 1 !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
            <span>
              Qty : {totalQuantity}
            </span>

            {firstItem && (
              <span>
                {formatPrice(firstItem.price)}
              </span>
            )}

            <span>
              Total : {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>

        <div className="col-span-2 justify-self-stretch pt-1 lg:col-span-1 lg:justify-self-end lg:pt-0">
          <div className="inline-flex min-h-11 w-full items-center justify-center gap-3 border border-[#CDBCA2] px-5 py-3 text-[15px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E] lg:w-auto lg:px-6 lg:py-4 lg:text-[17px]">
            <ShoppingBag size={20} />
            <span>Buy Again</span>
          </div>
        </div>

      </div>
    </Link>
  );
}
