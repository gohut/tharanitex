"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, RefreshCw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";

const TABS = ["All", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 8;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to load orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Failed to load orders");
        }
        const data = await res.json();
        if (!ignore) {
          setOrders(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load orders");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedOrders = orders.map((o) => ({
    id: String(o.id),
    customer: o.full_name || "Customer",
    email: o.city ? `${o.city}, ${o.state}` : "",
    date: new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    items: o.items || [],
    total: o.total_amount || 0,
    status: o.order_status ? o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1) : "Placed",
    payment: o.payment_status ? o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1) : "Pending",
  }));

  const filtered = normalizedOrders.filter((order) => {
    const normalizedSearch = search.toLowerCase();
    const matchTab = tab === "All" || order.status.toLowerCase() === tab.toLowerCase();
    const matchSearch =
      order.id.toLowerCase().includes(normalizedSearch) ||
      order.customer.toLowerCase().includes(normalizedSearch);

    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openOrder = (orderId) => {
    router.push(`/admin/orders/${encodeURIComponent(orderId)}`);
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2F2B27] text-2xl font-bold font-sans tracking-tight">Orders</h1>
          <p className="text-[#7C7267] text-sm mt-0.5 font-sans">Manage and track all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF6F0] text-[#5A1F2F] border border-[#E8DCC8] hover:border-[#D4AF37] text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#D4AF37]" : "text-[#D4AF37]"} /> Refresh
        </button>
      </div>

      <div className="flex gap-1 flex-wrap bg-white border border-[#E8DCC8] p-1 rounded-xl w-fit shadow-xs">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            onClick={() => {
              setTab(tabName);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all font-sans cursor-pointer ${
              tab === tabName ? "bg-[#D4AF37] text-[#2F2B27] shadow-xs" : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-[#FAF6F0]"
            }`}
          >
            {tabName}
            <span className="ml-1.5 text-[11px] opacity-70">
              ({tabName === "All" ? normalizedOrders.length : normalizedOrders.filter((o) => o.status.toLowerCase() === tabName.toLowerCase()).length})
            </span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by order ID or customer..."
          className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#8A8175] text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-sans"
        />
      </div>

      {error && (
        <div className="bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-[#FAF3E0] border-b border-[#E8DCC8]">
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Payment", ""].map((heading) => (
                  <th
                    key={heading || "open"}
                    className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#7C7267] animate-pulse font-sans">
                    Loading orders...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#7C7267] font-sans">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginated.map((order) => (
                  <tr
                    key={order.id}
                    tabIndex={0}
                    onClick={() => openOrder(order.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openOrder(order.id);
                      }
                    }}
                    className="hover:bg-[#FDFBF7] transition-colors cursor-pointer font-sans"
                  >
                    <td className="px-5 py-3.5 text-[#8C6D1F] font-bold text-xs whitespace-nowrap font-sans">#{order.id}</td>
                    <td className="px-5 py-3.5 min-w-44">
                      <p className="text-[#2F2B27] text-xs font-bold font-sans">{order.customer}</p>
                      <p className="text-[#7C7267] text-xs font-sans">{order.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#7C7267] text-xs whitespace-nowrap font-sans">{order.date}</td>
                    <td className="px-5 py-3.5 text-[#5C544B] text-xs whitespace-nowrap font-sans">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3.5 text-[#2F2B27] text-xs font-bold whitespace-nowrap font-sans">
                      Rs. {order.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.payment} /></td>
                    <td className="px-5 py-3.5 text-right text-[#7C7267]">
                      <ChevronRight size={16} className="ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-[#E8DCC8] bg-[#FDFBF7] flex items-center justify-between font-sans">
          <p className="text-[#7C7267] text-xs font-sans">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
