"use client";

import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/home/Navbar/Navbar";
import CustomerPageHeader from "@/components/orders/CustomerPageHeader";
import OrderTabs from "@/components/orders/OrderTabs";
import OrderCard from "@/components/orders/OrderCard";

const orderTabs = [
  "All Orders",
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/orders", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load orders");
        }

        const data = await res.json();

        setOrders(data);
      } catch (error) {
        console.error("Orders error:", error);
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const normalizeOrderStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "confirmed" || normalized === "packed") {
      return "processing";
    }

    return normalized;
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "All Orders") {
      return orders;
    }

    const targetStatus = activeTab.toLowerCase();

    return orders.filter(
      (order) =>
        normalizeOrderStatus(order.order_status) === targetStatus
    );
  }, [orders, activeTab]);

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 md:px-8 md:pt-12 lg:px-10">

        <CustomerPageHeader
          title="My Orders"
          description="Track and manage your orders"
        />

        <div className="mt-8">
          <OrderTabs
            tabs={orderTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="mt-10">

          {loading && (
            <div className="py-16 text-center text-[#8A8175]">
              Loading your orders...
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="font-serif text-3xl text-[#5A1F2F]">
                No Orders Found
              </h2>

              <p className="mt-3 text-[#8A8175]">
                {activeTab === "All Orders"
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeTab.toLowerCase()} orders.`}
              </p>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}

        </div>

      </section>
    </main>
  );
}
