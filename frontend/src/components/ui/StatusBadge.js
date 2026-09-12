export default function StatusBadge({ status }) {
  const map = {
    Active: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Inactive: "bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]",
    "Low Stock": "bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]",
    "Out of Stock": "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]",
    Pending: "bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]",
    Placed: "bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]",
    Processing: "bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]",
    Confirmed: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]",
    Packed: "bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]",
    Shipped: "bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]",
    Delivered: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Cancelled: "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]",
    Returned: "bg-[#F3E8FD] text-[#8430CE] border-[#E9D2FD]",
    Approved: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Rejected: "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]",
    Flagged: "bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]",
    Published: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Draft: "bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]",
    Open: "bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]",
    Resolved: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Paid: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    Refunded: "bg-[#F3E8FD] text-[#8430CE] border-[#E9D2FD]",
    Failed: "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]",
    VIP: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    New: "bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]",
    Regular: "bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]",
  };
  const cls = map[status] || "bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} font-sans`}>
      {status}
    </span>
  );
}
