import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import OrderStatusPill from "./OrderStatusPill";
import ReviewOrderItem from "./ReviewOrderItem";

export default function OrderCard({ order }) {
  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const status =
    order.order_status?.charAt(0).toUpperCase() +
    order.order_status?.slice(1);

  const totalQuantity =
    order.items?.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    ) || 0;

  const displayItems = Array.isArray(order.items)
    ? order.items
    : [];

  return (
    <div className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 transition hover:-translate-y-0.5 hover:shadow-sm md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#B5986B]">
            Order ID
          </p>

          <p className="mt-1 text-sm font-semibold text-[#25211C]">
            #{order.id}
          </p>
        </div>

        <OrderStatusPill status={status} />
      </div>

      <div className="mt-5 border-t border-[#E7DAC8] pt-5">
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
          <span>
            Qty : {totalQuantity}
          </span>

          <span>
            Total : {formatPrice(order.total_amount)}
          </span>

          <span>
            Placed On {formatDate(order.created_at)}
          </span>
        </div>

        <div className="space-y-6">
          {displayItems.map((item) => (
            <div
              key={item.id || `${order.id}-${item.product_id}`}
              className="grid gap-4 border-b border-[#E7DAC8] pb-6 last:border-b-0 last:pb-0 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-start"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[140px] w-[120px] object-cover"
                />
              ) : (
                <div className="flex h-[140px] w-[120px] items-center justify-center bg-[#F1E7D8] text-xs text-[#9A8B78]">
                  No Image
                </div>
              )}

              <div>
                <h3 className="line-clamp-2 text-[19px] font-semibold leading-tight text-[#25211C] sm:text-[23px]">
                  {item.name || "Product"}
                </h3>

                {item.variant_name && (
                  <p className="mt-2 text-sm text-[#8A8175]">
                    Variant: {item.variant_name}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#8A8175]">
                  <span>
                    Qty : {item.quantity}
                  </span>

                  <span>
                    {formatPrice(item.price)}
                  </span>
                </div>

                <ReviewOrderItem
                  orderId={order.id}
                  item={item}
                  orderStatus={order.order_status}
                  alreadyReviewed={
                    Boolean(item.has_review)
                  }
                />
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                {item.slug && (
                  <Link
                    href={`/product/${item.slug}`}
                    className="inline-flex min-h-11 items-center justify-center gap-3 border border-[#CDBCA2] px-5 py-3 text-[15px] font-semibold text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]"
                  >
                    <ShoppingBag size={20} />
                    <span>Buy Again</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}