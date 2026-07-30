"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/home/Navbar/Navbar";
import CustomerPageHeader from "@/components/orders/CustomerPageHeader";
import OrderTabs from "@/components/orders/OrderTabs";
import OrderCard from "@/components/orders/OrderCard";
import { getOrdersByTab, orderTabs } from "@/data/customerOrders";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All Orders");

  const orders = useMemo(() => getOrdersByTab(activeTab), [activeTab]);

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

        <div className="mt-10 space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
