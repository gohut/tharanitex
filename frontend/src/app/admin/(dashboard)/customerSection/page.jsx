"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  UserCheck,
  UserX,
  Users,
  ShieldCheck,
  ShieldX,
  UserPlus,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  IndianRupee,
  MapPin,
  X,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    newThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCustomers() {
      try {
        const res = await fetch("/api/admin/customers", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load customers");
        }

        if (!ignore) {
          setCustomers(data.customers || []);
          setStats(
            data.stats || {
              totalCustomers: 0,
              activeCustomers: 0,
              blockedCustomers: 0,
              newThisMonth: 0,
            }
          );
        }
      } catch (error) {
        console.error("Customer load error:", error);
        if (!ignore) toast.error(error.message || "Failed to load customers");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const fullName = `${customer.firstName || ""} ${
        customer.lastName || ""
      }`
        .trim()
        .toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query);

      const active = Boolean(customer.isActive);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "blocked" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  async function viewCustomer(id) {
    try {
      setDetailsLoading(true);

      const res = await fetch(`/api/admin/customers/${id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load customer");
      }

      setSelectedCustomer(data);
    } catch (error) {
      console.error("Customer details error:", error);
      toast.error(error.message || "Failed to load customer");
    } finally {
      setDetailsLoading(false);
    }
  }

  async function changeCustomerStatus(customer, isActive) {
    try {
      setStatusLoading(true);

      const res = await fetch(
        `/api/admin/customers/${customer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update customer status"
        );
      }

      toast.success(
        isActive
          ? "Customer unblocked"
          : "Customer blocked"
      );

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer((current) => ({
          ...current,
          isActive: isActive ? 1 : 0,
        }));
      }

      await loadCustomers();
    } catch (error) {
      console.error("Customer status error:", error);
      toast.error(
        error.message || "Failed to update customer status"
      );
    } finally {
      setStatusLoading(false);
    }
  }

  function getName(customer) {
    const name = `${customer.firstName || ""} ${
      customer.lastName || ""
    }`.trim();

    return name || "Unnamed Customer";
  }

  function getInitials(customer) {
    const first = customer.firstName?.[0] || "";
    const last = customer.lastName?.[0] || "";

    return `${first}${last}`.toUpperCase() || "C";
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(
      String(value).replace(" ", "T") + "Z"
    );

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-[#7A3E8A]",
      bg: "bg-[#F3EBF7] border-[#DFC4EB]",
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers,
      icon: ShieldCheck,
      color: "text-[#1E7E34]",
      bg: "bg-[#EAF6ED] border-[#BCE1C8]",
    },
    {
      title: "Blocked Customers",
      value: stats.blockedCustomers,
      icon: ShieldX,
      color: "text-[#C5221F]",
      bg: "bg-[#FDEEEC] border-[#F8BDB8]",
    },
    {
      title: "New This Month",
      value: stats.newThisMonth,
      icon: UserPlus,
      color: "text-[#B8860B]",
      bg: "bg-[#FAF3E0] border-[#E8D4A2]",
    },
  ];

  return (
    <>
      <div className="space-y-6 animate-fade-in font-sans">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#2F2B27] font-sans tracking-tight">
            Customer Management
          </h1>
          <p className="mt-0.5 text-sm text-[#7C7267] font-sans">
            View customers, account activity and order history.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-[#E8DCC8] bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#7C7267] font-sans">
                      {card.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#2F2B27] font-sans">
                      {card.value}
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${card.bg} ${card.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E8DCC8] bg-white p-4 shadow-xs md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] py-2.5 pl-10 pr-4 text-sm text-[#2F2B27] outline-none placeholder:text-[#8A8175] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] px-4 py-2.5 text-sm text-[#2F2B27] outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] md:w-48 font-sans cursor-pointer"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-[#E8DCC8] bg-white shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2
                size={26}
                className="animate-spin text-[#D4AF37]"
              />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <Users
                size={36}
                className="mb-3 text-[#7C7267]"
              />
              <p className="font-bold text-[#2F2B27] font-sans">
                No customers found
              </p>
              <p className="mt-1 text-xs text-[#7C7267] font-sans">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] font-sans">
                <thead className="border-b border-[#E8DCC8] bg-[#FAF3E0]">
                  <tr className="text-left text-xs uppercase tracking-wider text-[#5A1F2F] font-bold">
                    <th className="px-5 py-3.5 font-bold">
                      Customer
                    </th>
                    <th className="px-5 py-3.5 font-bold">
                      Phone
                    </th>
                    <th className="px-5 py-3.5 text-center font-bold">
                      Orders
                    </th>
                    <th className="px-5 py-3.5 font-bold">
                      Total Spent
                    </th>
                    <th className="px-5 py-3.5 font-bold">
                      Joined
                    </th>
                    <th className="px-5 py-3.5 font-bold">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                  {filteredCustomers.map((customer) => {
                    const active = Boolean(customer.isActive);

                    return (
                      <tr
                        key={customer.id}
                        className="transition-colors hover:bg-[#FDFBF7]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#FAF3E0] text-sm font-bold text-[#8C6D1F]">
                              {getInitials(customer)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#2F2B27]">
                                {getName(customer)}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#7C7267]">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#5C544B]">
                          {customer.phone || "—"}
                        </td>

                        <td className="px-5 py-4 text-center text-sm font-bold text-[#2F2B27]">
                          {Number(customer.orderCount) || 0}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-[#8C6D1F]">
                          {formatMoney(customer.totalSpent)}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#7C7267]">
                          {formatDate(customer.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              active
                                ? "border-[#BCE1C8] bg-[#EAF6ED] text-[#1E7E34]"
                                : "border-[#F8BDB8] bg-[#FDEEEC] text-[#C5221F]"
                            }`}
                          >
                            {active ? "Active" : "Blocked"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => viewCustomer(customer.id)}
                              className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] p-2 text-[#5A1F2F] hover:bg-[#FAF3E0] hover:border-[#D4AF37] transition cursor-pointer"
                              title="View customer"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={statusLoading}
                              onClick={() =>
                                changeCustomerStatus(
                                  customer,
                                  !active
                                )
                              }
                              className={`rounded-xl border p-2 transition cursor-pointer disabled:opacity-50 ${
                                active
                                  ? "border-[#F8BDB8] bg-[#FDEEEC] text-[#C5221F] hover:bg-[#F8BDB8]"
                                  : "border-[#BCE1C8] bg-[#EAF6ED] text-[#1E7E34] hover:bg-[#BCE1C8]"
                              }`}
                              title={
                                active
                                  ? "Block customer"
                                  : "Unblock customer"
                              }
                            >
                              {active ? (
                                <UserX size={15} />
                              ) : (
                                <UserCheck size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && (
          <p className="text-right text-xs text-[#7C7267] font-sans">
            Showing {filteredCustomers.length} of{" "}
            {customers.length} customers
          </p>
        )}
      </div>

      {/* DETAILS LOADER */}
      {detailsLoading && !selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <Loader2
            size={30}
            className="animate-spin text-[#D4AF37]"
          />
        </div>
      )}

      {/* CUSTOMER DETAILS */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E8DCC8] bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DCC8] bg-[#FDFBF7] px-6 py-4 rounded-t-2xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F] font-sans">
                  Customer #{selectedCustomer.id}
                </p>
                <h2 className="mt-0.5 text-xl font-bold text-[#2F2B27] font-sans">
                  {getName(selectedCustomer)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-[#FAF6F0] p-2 text-[#7C7267] transition hover:bg-[#F4ECE1] hover:text-[#2F2B27] border border-[#E8DCC8]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* PROFILE + SUMMARY */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#E8DCC8] bg-[#FAF6F0] p-5 lg:col-span-2">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#FAF3E0] text-lg font-bold text-[#8C6D1F]">
                      {getInitials(selectedCustomer)}
                    </div>

                    <div>
                      <p className="font-bold text-[#2F2B27] text-base">
                        {getName(selectedCustomer)}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          Boolean(selectedCustomer.isActive)
                            ? "border-[#BCE1C8] bg-[#EAF6ED] text-[#1E7E34]"
                            : "border-[#F8BDB8] bg-[#FDEEEC] text-[#C5221F]"
                        }`}
                      >
                        {Boolean(selectedCustomer.isActive)
                          ? "Active"
                          : "Blocked"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={selectedCustomer.email || "—"}
                    />
                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={selectedCustomer.phone || "—"}
                    />
                    <InfoItem
                      icon={CalendarDays}
                      label="Joined"
                      value={formatDate(selectedCustomer.createdAt)}
                    />
                    <InfoItem
                      icon={Users}
                      label="Customer ID"
                      value={`#${selectedCustomer.id}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <SummaryCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={Number(selectedCustomer.orderCount) || 0}
                  />
                  <SummaryCard
                    icon={IndianRupee}
                    label="Total Spent"
                    value={formatMoney(selectedCustomer.totalSpent)}
                  />
                </div>
              </div>

              {/* ADDRESSES */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="text-[#8C6D1F]"
                  />
                  <h3 className="font-bold text-[#2F2B27]">
                    Addresses
                  </h3>
                </div>

                {selectedCustomer.addresses?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCustomer.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="rounded-2xl border border-[#E8DCC8] bg-white p-4 shadow-xs"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-bold text-[#2F2B27]">
                            {address.fullName}
                          </p>
                          {Boolean(address.isDefault) && (
                            <span className="rounded-full border border-[#D4AF37]/40 bg-[#FAF3E0] px-2 py-0.5 text-[10px] font-bold text-[#8C6D1F]">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs leading-5 text-[#5C544B]">
                          {address.addressLine1}
                          {address.addressLine2 && (
                            <>
                              <br />
                              {address.addressLine2}
                            </>
                          )}
                          <br />
                          {address.city}, {address.state}{" "}
                          {address.pincode}
                          <br />
                          {address.country || "India"}
                        </p>

                        <p className="mt-3 text-xs text-[#7C7267] font-medium">
                          {address.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBox text="No saved addresses" />
                )}
              </section>

              {/* ORDER HISTORY */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Package
                    size={17}
                    className="text-[#8C6D1F]"
                  />
                  <h3 className="font-bold text-[#2F2B27]">
                    Order History
                  </h3>
                </div>

                {selectedCustomer.orders?.length ? (
                  <div className="overflow-hidden rounded-2xl border border-[#E8DCC8]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] font-sans">
                        <thead className="bg-[#FAF3E0] border-b border-[#E8DCC8]">
                          <tr className="text-left text-xs uppercase font-bold text-[#5A1F2F]">
                            <th className="px-4 py-3 font-bold">
                              Order
                            </th>
                            <th className="px-4 py-3 font-bold">
                              Date
                            </th>
                            <th className="px-4 py-3 font-bold">
                              Amount
                            </th>
                            <th className="px-4 py-3 font-bold">
                              Payment
                            </th>
                            <th className="px-4 py-3 font-bold">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                          {selectedCustomer.orders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#FDFBF7]">
                              <td className="px-4 py-3 text-sm font-bold text-[#8C6D1F]">
                                #{order.id}
                              </td>
                              <td className="px-4 py-3 text-xs text-[#7C7267]">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-[#2F2B27]">
                                {formatMoney(order.totalAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <OrderBadge value={order.paymentStatus} />
                              </td>
                              <td className="px-4 py-3">
                                <OrderBadge value={order.orderStatus} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyBox text="This customer has not placed any orders yet" />
                )}
              </section>

              {/* ACTION */}
              <div className="flex justify-end border-t border-[#E8DCC8] pt-5">
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() =>
                    changeCustomerStatus(
                      selectedCustomer,
                      !Boolean(selectedCustomer.isActive)
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 cursor-pointer ${
                    Boolean(selectedCustomer.isActive)
                      ? "border-[#F8BDB8] bg-[#FDEEEC] text-[#C5221F] hover:bg-[#F8BDB8]"
                      : "border-[#BCE1C8] bg-[#EAF6ED] text-[#1E7E34] hover:bg-[#BCE1C8]"
                  }`}
                >
                  {statusLoading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : Boolean(selectedCustomer.isActive) ? (
                    <UserX size={15} />
                  ) : (
                    <UserCheck size={15} />
                  )}

                  {Boolean(selectedCustomer.isActive)
                    ? "Block Customer"
                    : "Unblock Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#8C6D1F]">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[#7C7267] font-bold">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-[#2F2B27]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#E8DCC8] bg-white p-4 shadow-xs">
      <Icon
        size={18}
        className="mb-2 text-[#8C6D1F]"
      />
      <p className="text-xs font-bold text-[#7C7267] uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[#2F2B27]">
        {value}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E8DCC8] bg-[#FAF6F0] p-8 text-center text-sm text-[#7C7267] font-medium">
      {text}
    </div>
  );
}

function OrderBadge({ value }) {
  const label = value || "unknown";

  return (
    <span className="inline-flex rounded-full border border-[#E8DCC8] bg-[#FAF6F0] px-2.5 py-0.5 text-[11px] font-semibold capitalize text-[#2F2B27]">
      {label.replaceAll("_", " ")}
    </span>
  );
}