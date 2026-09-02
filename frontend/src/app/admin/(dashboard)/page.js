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
    { title: "Orders", count: `${totalOrders} total`, href: "/admin/orders", icon: ShoppingCart, color: "text-blue-400" },
    { title: "Customers", count: "Directory & History", href: "/admin/customerSection", icon: Users, color: "text-purple-400" },
    { title: "Products", count: "Inventory Catalog", href: "/admin/products", icon: Package, color: "text-emerald-400" },
    { title: "Reviews", count: "Moderation", href: "/admin/reviews", icon: Star, color: "text-amber-400" },
    { title: "Store Content", count: "Banners & Sections", href: "/admin/content", icon: FileText, color: "text-pink-400" },
    { title: "Users & Roles", count: "Permissions", href: "/admin/users", icon: Shield, color: "text-indigo-400" },
    { title: "Settings", count: "Configuration", href: "/admin/settings", icon: Settings, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-green-400 mt-0.5">
            Welcome back to Tharani Textiles Store Administration
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-green-800 hover:bg-green-700 text-green-200 hover:text-white text-xs font-semibold rounded-xl transition w-fit"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-900/60 border border-red-700 text-red-200 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Total Revenue</span>
            <span className="p-2 bg-gold-600/20 text-gold-400 rounded-xl"><TrendingUp size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-3">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">Excludes cancelled orders</p>
        </div>

        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Total Orders</span>
            <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl"><ShoppingCart size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{totalOrders}</p>
          <p className="text-xs text-green-500 mt-1">{pendingOrders} active processing</p>
        </div>

        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Active Processing</span>
            <span className="p-2 bg-amber-600/20 text-amber-400 rounded-xl"><Clock size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{pendingOrders}</p>
          <p className="text-xs text-green-500 mt-1">Placed or confirmed state</p>
        </div>

        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Cancellation Requests</span>
            <span className="p-2 bg-red-600/20 text-red-400 rounded-xl"><AlertTriangle size={18} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{pendingCancellations}</p>
          <p className="text-xs text-red-300 mt-1">
            {pendingCancellations > 0 ? "Requires admin review" : "No pending requests"}
          </p>
        </div>
      </div>

      {/* Navigation Quick Access */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Management Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickNav.map(({ title, count, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-green-900 border border-green-800 hover:border-gold-600/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className={`p-2.5 rounded-xl bg-green-950/60 ${color}`}>
                  <Icon size={20} />
                </span>
                <ArrowRight size={16} className="text-green-600 group-hover:text-gold-400 transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-gold-300 transition-colors">{title}</h3>
                <p className="text-xs text-green-400 mt-0.5">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders Overview */}
      <section className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-green-400 mt-0.5">Latest transactions requiring review</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-green-800 text-green-400 uppercase">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-green-400 animate-pulse">
                    Loading dashboard orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-green-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-green-800/30 transition">
                    <td className="py-3 px-3 text-gold-400 font-semibold">#{order.id}</td>
                    <td className="py-3 px-3 text-white font-medium">{order.full_name || order.customer_name || "Customer"}</td>
                    <td className="py-3 px-3 text-white font-semibold">Rs. {Number(order.total_amount).toLocaleString()}</td>
                    <td className="py-3 px-3"><StatusBadge status={order.order_status} /></td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gold-400 hover:underline font-semibold"
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
