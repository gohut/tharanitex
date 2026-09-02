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
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers,
      icon: ShieldCheck,
    },
    {
      title: "Blocked Customers",
      value: stats.blockedCustomers,
      icon: ShieldX,
    },
    {
      title: "New This Month",
      value: stats.newThisMonth,
      icon: UserPlus,
    },
  ];

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-white">
            Customer Management
          </h1>

          <p className="mt-1 text-sm text-green-400">
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
                className="rounded-2xl border border-green-800 bg-green-900 p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-400">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {card.value}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-700 bg-green-800 text-gold-500">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}

        <div className="flex flex-col gap-3 rounded-2xl border border-green-800 bg-green-900 p-4 shadow-card md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-xl border border-green-700 bg-green-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-green-600 focus:border-gold-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-green-700 bg-green-950 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 md:w-48"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-green-800 bg-green-900 shadow-card">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2
                size={26}
                className="animate-spin text-gold-500"
              />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <Users
                size={36}
                className="mb-3 text-green-600"
              />

              <p className="font-medium text-white">
                No customers found
              </p>

              <p className="mt-1 text-xs text-green-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-green-800 bg-green-950/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-green-400">
                    <th className="px-5 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-center font-medium">
                      Orders
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Total Spent
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Joined
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-green-800">
                  {filteredCustomers.map((customer) => {
                    const active = Boolean(customer.isActive);

                    return (
                      <tr
                        key={customer.id}
                        className="transition-colors hover:bg-green-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-700 bg-green-800 text-sm font-semibold text-gold-500">
                              {getInitials(customer)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {getName(customer)}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-green-400">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-green-200">
                          {customer.phone || "—"}
                        </td>

                        <td className="px-5 py-4 text-center text-sm font-medium text-white">
                          {Number(customer.orderCount) || 0}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gold-500">
                          {formatMoney(customer.totalSpent)}
                        </td>

                        <td className="px-5 py-4 text-sm text-green-300">
                          {formatDate(customer.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                              active
                                ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                                : "border-red-800 bg-red-900/30 text-red-300"
                            }`}
                          >
                            {active ? "Active" : "Blocked"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                viewCustomer(customer.id)
                              }
                              className="rounded-lg border border-green-700 bg-green-800 p-2 text-green-300 transition hover:bg-green-700 hover:text-white"
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
                              className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                                active
                                  ? "border-red-800 bg-red-900/30 text-red-400 hover:bg-red-900/60"
                                  : "border-emerald-700 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/60"
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
          <p className="text-right text-xs text-green-500">
            Showing {filteredCustomers.length} of{" "}
            {customers.length} customers
          </p>
        )}
      </div>

      {/* DETAILS LOADER */}

      {detailsLoading && !selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loader2
            size={30}
            className="animate-spin text-gold-500"
          />
        </div>
      )}

      {/* CUSTOMER DETAILS */}

      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-green-700 bg-green-950 shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-800 bg-green-950 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gold-500">
                  Customer #{selectedCustomer.id}
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  {getName(selectedCustomer)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg bg-green-900 p-2 text-green-400 transition hover:bg-green-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* PROFILE + SUMMARY */}

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-green-800 bg-green-900 p-5 lg:col-span-2">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-700 bg-green-800 text-lg font-bold text-gold-500">
                      {getInitials(selectedCustomer)}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {getName(selectedCustomer)}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                          Boolean(selectedCustomer.isActive)
                            ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                            : "border-red-800 bg-red-900/30 text-red-300"
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
                      value={formatDate(
                        selectedCustomer.createdAt
                      )}
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
                    value={
                      Number(selectedCustomer.orderCount) || 0
                    }
                  />

                  <SummaryCard
                    icon={IndianRupee}
                    label="Total Spent"
                    value={formatMoney(
                      selectedCustomer.totalSpent
                    )}
                  />
                </div>
              </div>

              {/* ADDRESSES */}

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="text-gold-500"
                  />

                  <h3 className="font-semibold text-white">
                    Addresses
                  </h3>
                </div>

                {selectedCustomer.addresses?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCustomer.addresses.map(
                      (address) => (
                        <div
                          key={address.id}
                          className="rounded-2xl border border-green-800 bg-green-900 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">
                              {address.fullName}
                            </p>

                            {Boolean(address.isDefault) && (
                              <span className="rounded-full border border-gold-700 bg-gold-900/20 px-2 py-0.5 text-[10px] text-gold-400">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs leading-5 text-green-300">
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

                          <p className="mt-3 text-xs text-green-500">
                            {address.phone}
                          </p>
                        </div>
                      )
                    )}
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
                    className="text-gold-500"
                  />

                  <h3 className="font-semibold text-white">
                    Order History
                  </h3>
                </div>

                {selectedCustomer.orders?.length ? (
                  <div className="overflow-hidden rounded-2xl border border-green-800">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px]">
                        <thead className="bg-green-900">
                          <tr className="text-left text-xs text-green-400">
                            <th className="px-4 py-3 font-medium">
                              Order
                            </th>

                            <th className="px-4 py-3 font-medium">
                              Date
                            </th>

                            <th className="px-4 py-3 font-medium">
                              Amount
                            </th>

                            <th className="px-4 py-3 font-medium">
                              Payment
                            </th>

                            <th className="px-4 py-3 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-green-800 bg-green-950">
                          {selectedCustomer.orders.map(
                            (order) => (
                              <tr key={order.id}>
                                <td className="px-4 py-3 text-sm font-medium text-white">
                                  #{order.id}
                                </td>

                                <td className="px-4 py-3 text-xs text-green-300">
                                  {formatDate(order.createdAt)}
                                </td>

                                <td className="px-4 py-3 text-sm font-semibold text-gold-500">
                                  {formatMoney(
                                    order.totalAmount
                                  )}
                                </td>

                                <td className="px-4 py-3">
                                  <OrderBadge
                                    value={
                                      order.paymentStatus
                                    }
                                  />
                                </td>

                                <td className="px-4 py-3">
                                  <OrderBadge
                                    value={
                                      order.orderStatus
                                    }
                                  />
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyBox text="This customer has not placed any orders yet" />
                )}
              </section>

              {/* ACTION */}

              <div className="flex justify-end border-t border-green-800 pt-5">
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() =>
                    changeCustomerStatus(
                      selectedCustomer,
                      !Boolean(selectedCustomer.isActive)
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                    Boolean(selectedCustomer.isActive)
                      ? "border-red-800 bg-red-900/30 text-red-300 hover:bg-red-900/60"
                      : "border-emerald-700 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/60"
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
      <div className="mt-0.5 text-green-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-green-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm text-green-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-green-800 bg-green-900 p-4">
      <Icon
        size={18}
        className="mb-3 text-gold-500"
      />

      <p className="text-xs text-green-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-green-800 bg-green-900/40 p-8 text-center text-sm text-green-500">
      {text}
    </div>
  );
}

function OrderBadge({ value }) {
  const label = value || "unknown";

  return (
    <span className="inline-flex rounded-full border border-green-700 bg-green-900 px-2.5 py-1 text-[11px] capitalize text-green-300">
      {label.replaceAll("_", " ")}
    </span>
  );
}