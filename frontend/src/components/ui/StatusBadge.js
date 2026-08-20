export default function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-700 text-green-200 border-green-600",
    Inactive: "bg-dark-800 text-green-500 border-green-700",
    "Low Stock": "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    "Out of Stock": "bg-red-900/50 text-red-300 border-red-800",
    Pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    Placed: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    Processing: "bg-blue-900/50 text-blue-300 border-blue-800",
    Confirmed: "bg-cyan-900/50 text-cyan-300 border-cyan-800",
    Packed: "bg-indigo-900/50 text-indigo-300 border-indigo-800",
    Shipped: "bg-blue-900/50 text-blue-300 border-blue-800",
    Delivered: "bg-green-900/50 text-green-300 border-green-700",
    Cancelled: "bg-red-900/50 text-red-300 border-red-800",
    Returned: "bg-purple-900/50 text-purple-300 border-purple-800",
    Approved: "bg-green-900/50 text-green-300 border-green-700",
    Rejected: "bg-red-900/50 text-red-300 border-red-800",
    Flagged: "bg-orange-900/50 text-orange-300 border-orange-800",
    Published: "bg-green-900/50 text-green-300 border-green-700",
    Draft: "bg-gray-800 text-gray-400 border-gray-700",
    Open: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    Resolved: "bg-green-900/50 text-green-300 border-green-700",
    Paid: "bg-green-900/50 text-green-300 border-green-700",
    Refunded: "bg-purple-900/50 text-purple-300 border-purple-800",
    Failed: "bg-red-900/50 text-red-300 border-red-800",
    VIP: "bg-gold-900/30 text-gold-400 border-gold-800",
    New: "bg-blue-900/50 text-blue-300 border-blue-800",
    Regular: "bg-green-900/50 text-green-400 border-green-700",
  };
  const cls = map[status] || "bg-dark-800 text-green-400 border-green-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}
