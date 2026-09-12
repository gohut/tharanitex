"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  Star,
  FileText,
  Shield,
  Settings,
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingCancellations, setPendingCancellations] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized admin access. Please log in.");
        }
        throw new Error("Failed to fetch dashboard data.");
      }
      const data = await res.json();
      const orderList = Array.isArray(data) ? data : data.data || [];
      setOrders(orderList);

      setTotalOrders(orderList.length);
      const pending = orderList.filter((o) =>
        ["placed", "confirmed", "processing"].includes(
          (o.order_status || "").toLowerCase()
        )
      ).length;
      setPendingOrders(pending);

      const cancelRequests = orderList.filter((o) =>
        (o.order_status || "").toLowerCase().includes("cancel")
      ).length;
      setPendingCancellations(cancelRequests);

      const revenue = orderList
        .filter((o) => (o.order_status || "").toLowerCase() !== "cancelled")
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickNav = [
    { title: "Orders", count: `${totalOrders} total`, href: "/admin/orders", icon: ShoppingCart, color: "text-[#1E5F8A]", bg: "bg-[#EBF3FB] border-[#BDD9F0]" },
    { title: "Customers", count: "Directory & History", href: "/admin/customers", icon: Users, color: "text-[#7A3E8A]", bg: "bg-[#F3EBF7] border-[#DFC4EB]" },
    { title: "Products", count: "Inventory Catalog", href: "/admin/products", icon: Package, color: "text-[#1E7E34]", bg: "bg-[#EAF6ED] border-[#BCE1C8]" },
    { title: "Reviews", count: "Moderation", href: "/admin/reviews", icon: Star, color: "text-[#B8860B]", bg: "bg-[#FAF3E0] border-[#E8D4A2]" },
    { title: "Store Content", count: "Banners & Sections", href: "/admin/content", icon: FileText, color: "text-[#C05621]", bg: "bg-[#FDF0EB] border-[#F8D2C2]" },
    { title: "Users & Roles", count: "Permissions", href: "/admin/users", icon: Shield, color: "text-[#5A1F2F]", bg: "bg-[#F5E6EB] border-[#E2BAC7]" },
    { title: "Settings", count: "Configuration", href: "/admin/settings", icon: Settings, color: "text-[#5F6368]", bg: "bg-[#F1F3F4] border-[#DADCE0]" },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2B27] font-sans tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[#7C7267] mt-0.5 font-sans">
            Welcome back to Tharani Textiles Store Administration
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF6F0] text-[#5A1F2F] border border-[#E8DCC8] hover:border-[#D4AF37] text-xs font-bold rounded-xl transition shadow-xs w-fit cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#D4AF37]" : "text-[#D4AF37]"} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-sm p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7C7267] uppercase tracking-wider font-sans">Total Revenue</span>
            <span className="p-2.5 bg-[#FAF3E0] border border-[#E8D4A2] text-[#B8860B] rounded-xl"><TrendingUp size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-[#2F2B27] mt-3 font-sans">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#7C7267] mt-1 font-sans">Excludes cancelled orders</p>
        </div>

        <div className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7C7267] uppercase tracking-wider font-sans">Total Orders</span>
            <span className="p-2.5 bg-[#EBF3FB] border border-[#BDD9F0] text-[#1E5F8A] rounded-xl"><ShoppingCart size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-[#2F2B27] mt-3 font-sans">{totalOrders}</p>
          <p className="text-xs text-[#7C7267] mt-1 font-sans">{pendingOrders} active processing</p>
        </div>

        <div className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7C7267] uppercase tracking-wider font-sans">Active Processing</span>
            <span className="p-2.5 bg-[#FFF6E5] border border-[#FDE1A9] text-[#B26B00] rounded-xl"><Clock size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-[#2F2B27] mt-3 font-sans">{pendingOrders}</p>
          <p className="text-xs text-[#7C7267] mt-1 font-sans">Placed or confirmed state</p>
        </div>

        <div className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7C7267] uppercase tracking-wider font-sans">Cancellation Requests</span>
            <span className="p-2.5 bg-[#FDEEEC] border border-[#F8BDB8] text-[#C5221F] rounded-xl"><AlertTriangle size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-[#2F2B27] mt-3 font-sans">{pendingCancellations}</p>
          <p className="text-xs text-[#C5221F] mt-1 font-sans font-medium">
            {pendingCancellations > 0 ? "Requires admin review" : "No pending requests"}
          </p>
        </div>
      </div>

      {/* Navigation Quick Access */}
      <section className="space-y-3 font-sans">
        <h2 className="text-lg font-bold text-[#2F2B27] font-sans">Management Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickNav.map(({ title, count, href, icon: Icon, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-[#E8DCC8] hover:border-[#D4AF37] rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className={`p-2.5 rounded-xl border ${bg} ${color}`}>
                  <Icon size={20} />
                </span>
                <ArrowRight size={16} className="text-[#7C7267] group-hover:text-[#5A1F2F] transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-[#2F2B27] group-hover:text-[#5A1F2F] transition-colors font-sans">{title}</h3>
                <p className="text-xs text-[#7C7267] mt-0.5 font-sans">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders Overview */}
      <section className="bg-white border border-[#E8DCC8] rounded-2xl p-5 shadow-xs space-y-4 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2F2B27] font-sans">Recent Customer Orders</h2>
            <p className="text-xs text-[#7C7267] mt-0.5 font-sans">Latest transactions requiring review</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#8C6D1F] hover:text-[#5A1F2F] inline-flex items-center gap-1 font-sans"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E8DCC8]">
          <table className="w-full text-xs text-left font-sans">
            <thead>
              <tr className="bg-[#FAF3E0] text-[#5A1F2F] border-b border-[#E8DCC8] uppercase font-bold tracking-wider">
                <th className="py-3 px-4 font-sans">Order ID</th>
                <th className="py-3 px-4 font-sans">Customer</th>
                <th className="py-3 px-4 font-sans">Amount</th>
                <th className="py-3 px-4 font-sans">Status</th>
                <th className="py-3 px-4 text-right font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7C7267] animate-pulse font-sans">
                    Loading dashboard orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7C7267] font-sans">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FDFBF7] transition">
                    <td className="py-3 px-4 text-[#8C6D1F] font-bold font-sans">#{order.id}</td>
                    <td className="py-3 px-4 text-[#2F2B27] font-medium font-sans">{order.full_name || order.customer_name || "Customer"}</td>
                    <td className="py-3 px-4 text-[#2F2B27] font-bold font-sans">Rs. {Number(order.total_amount).toLocaleString()}</td>
                    <td className="py-3 px-4"><StatusBadge status={order.order_status} /></td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#8C6D1F] hover:text-[#5A1F2F] font-bold hover:underline font-sans"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
