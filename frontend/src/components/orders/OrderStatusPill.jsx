const styles = {
  Placed: "border-[#E4C98B] bg-[#FAF1DB] text-[#AE7C15]",
  Processing: "border-[#E4C98B] bg-[#FAF1DB] text-[#AE7C15]",
  Shipped: "border-[#C8D9E9] bg-[#EEF5FB] text-[#3E769D]",
  Delivered: "border-[#CFE4C8] bg-[#E6F3DE] text-[#64A15A]",
  Cancelled: "border-[#E5C5C5] bg-[#F8E5E5] text-[#B05A5A]",
};

export default function OrderStatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-[8px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${styles[status] || styles.Processing}`}
    >
      {status}
    </span>
  );
}
