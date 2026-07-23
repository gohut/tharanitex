"use client";
import { useState } from "react";
import {
  ShoppingCart, Clock, DollarSign, AlertTriangle,
  Package, Eye,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { orders, revenueData } from "../../data/orders";
import { products } from "../../data/products";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-green-900 border border-green-700 rounded-xl p-3 shadow-card">
        <p className="text-green-300 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-semibold">
            {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [chartMode, setChartMode] = useState("weekly");
  const [chartType, setChartType] = useState("line");

  const todayOrders = orders.filter((o) => o.date === "2025-07-17").length;
  const pendingOrders = orders.filter((o) => ["Placed", "Confirmed", "Packed"].includes(o.status)).length;
  const todayRevenue = orders
    .filter((o) => o.date === "2025-07-17")
    .reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.status === "Low Stock" || p.stock === 0);

  const data = revenueData[chartMode];
  const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-green-400 text-sm mt-0.5">Welcome back, Gowtham. Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Orders Today" value={todayOrders} icon={ShoppingCart} trend="up" trendValue="+12%" color="gold" />
        <StatCard title="Open Orders" value={pendingOrders} icon={Clock} trend="down" trendValue="-3" color="blue" />
        <StatCard title="Revenue Today" value={`₹${todayRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="+8%" color="green" />
        <StatCard title="Low Stock Alerts" value={lowStockProducts.length} icon={AlertTriangle} trend="up" trendValue="+1" color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-white font-semibold">Revenue Overview</h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-green-800 p-0.5 text-xs">
                {["weekly", "monthly"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                      chartMode === m ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg bg-green-800 p-0.5 text-xs">
                {["line", "bar"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                      chartType === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#145C3E" />
                <XAxis dataKey="label" tick={{ fill: "#4EC48A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4EC48A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} dot={{ fill: "#D4AF37", r: 4 }} activeDot={{ r: 6, fill: "#F0C846" }} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#145C3E" />
                <XAxis dataKey="label" tick={{ fill: "#4EC48A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4EC48A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#1E7D50" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Low Stock Widget */}
        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Low Stock</h2>
            <AlertTriangle size={16} className="text-gold-500" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-800 flex items-center justify-center">
                  <Package size={16} className="text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.name}</p>
                  <p className="text-green-400 text-xs">{p.stock} left</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-green-500 text-sm text-center py-4">All products well-stocked ✓</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-green-800">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <a href="/admin/orders" className="text-gold-400 text-xs hover:text-gold-300 flex items-center gap-1">
            <Eye size={13} /> View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-800">
                {["Order ID", "Customer", "Date", "Total", "Status", "Payment"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors table-row-hover">
                  <td className="px-5 py-3 text-gold-400 font-medium text-xs">{o.id}</td>
                  <td className="px-5 py-3 text-white text-xs">{o.customer}</td>
                  <td className="px-5 py-3 text-green-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3 text-white text-xs font-semibold">₹{o.total.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3"><StatusBadge status={o.payment} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
