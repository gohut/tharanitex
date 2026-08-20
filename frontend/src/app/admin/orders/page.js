"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, RefreshCw } from "lucide-react";
import Pagination from "../../../components/ui/Pagination";
import StatusBadge from "../../../components/ui/StatusBadge";

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
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Orders</h1>
          <p className="text-green-400 text-sm mt-0.5">Manage and track all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-800 text-green-200 hover:text-white rounded-lg text-xs font-medium transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex gap-1 flex-wrap bg-green-900 p-1 rounded-xl w-fit">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            onClick={() => {
              setTab(tabName);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === tabName ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}
          >
            {tabName}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({tabName === "All" ? normalizedOrders.length : normalizedOrders.filter((o) => o.status.toLowerCase() === tabName.toLowerCase()).length})
            </span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by order ID or customer..."
          className="w-full bg-green-900 border border-green-700 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
        />
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-800">
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Payment", ""].map((heading) => (
                  <th
                    key={heading || "open"}
                    className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-green-400 animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-green-500">
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
                    className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors cursor-pointer focus-visible:bg-green-800/40"
                  >
                    <td className="px-4 py-3 text-gold-400 font-medium text-xs whitespace-nowrap">#{order.id}</td>
                    <td className="px-4 py-3 min-w-44">
                      <p className="text-white text-xs font-medium">{order.customer}</p>
                      <p className="text-green-500 text-xs">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 text-green-400 text-xs whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3 text-green-300 text-xs whitespace-nowrap">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-white text-xs font-semibold whitespace-nowrap">
                      Rs. {order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.payment} /></td>
                    <td className="px-4 py-3 text-right text-green-500">
                      <ChevronRight size={16} className="ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-green-800 flex items-center justify-between">
          <p className="text-green-500 text-xs">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
