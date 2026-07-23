"use client";
import { useState } from "react";
import { Search, Eye, Mail, Phone, MapPin, ShoppingCart, MessageSquare } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/ui/Pagination";
import { customers as initialCustomers } from "../../../data/customers";

const PAGE_SIZE = 8;

export default function CustomersPage() {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [filterSeg, setFilterSeg] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [profileTab, setProfileTab] = useState("orders");

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchSeg = filterSeg === "All" || c.segment === filterSeg;
    return matchSearch && matchSeg;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openProfile = (c) => { setSelected(c); setProfileTab("orders"); setModal("profile"); };

  const segColors = { VIP: "text-gold-400", New: "text-blue-400", Regular: "text-green-400" };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Customers</h1>
        <p className="text-green-400 text-sm mt-0.5">Manage customer accounts and support</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {["All","VIP","New","Regular"].slice(1).map((seg) => (
          <div key={seg} className="bg-green-900 border border-green-800 rounded-xl p-4">
            <p className="text-green-400 text-xs uppercase tracking-wider mb-1">{seg} Customers</p>
            <p className={`text-2xl font-bold ${segColors[seg]}`}>
              {customers.filter((c) => c.segment === seg).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customers..." className="w-full bg-green-900 border border-green-700 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500" />
        </div>
        <div className="flex gap-1 bg-green-900 p-1 rounded-xl">
          {["All","VIP","New","Regular"].map((s) => (
            <button key={s} onClick={() => { setFilterSeg(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterSeg === s ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
              }`}>{s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-800">
                {["Customer","Email","Orders","Total Spend","Segment","Status","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-green-500">No customers found</td></tr>
              ) : paginated.map((c) => (
                <tr key={c.id} className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-600/20 border border-gold-800/40 flex items-center justify-center">
                        <span className="text-gold-400 text-xs font-bold">{c.name.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      <p className="text-white text-xs font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-green-300 text-xs">{c.email}</td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">{c.orders}</td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.segment} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => openProfile(c)} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 hover:text-white transition-colors">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-green-800 flex items-center justify-between">
          <p className="text-green-500 text-xs">{filtered.length} customer{filtered.length !== 1 ? "s" : ""}</p>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </div>

      {/* Customer Profile Modal */}
      <Modal open={modal === "profile"} onClose={() => setModal(null)} title={selected?.name} size="xl">
        {selected && (
          <div className="space-y-4">
            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-800/50 rounded-xl p-4 space-y-2">
                <p className="text-green-400 text-xs uppercase font-medium tracking-wider mb-2">Contact</p>
                <p className="text-white font-semibold">{selected.name}</p>
                <p className="text-green-300 text-xs flex items-center gap-1"><Mail size={12} /> {selected.email}</p>
                <p className="text-green-300 text-xs flex items-center gap-1"><Phone size={12} /> {selected.phone}</p>
                <p className="text-green-300 text-xs flex items-center gap-1"><MapPin size={12} /> {selected.address}</p>
              </div>
              <div className="bg-green-800/50 rounded-xl p-4 space-y-2">
                <p className="text-green-400 text-xs uppercase font-medium tracking-wider mb-2">Stats</p>
                <p className="text-white text-sm"><span className="text-green-400">Segment:</span> <StatusBadge status={selected.segment} /></p>
                <p className="text-white text-sm"><span className="text-green-400">Orders:</span> {selected.orders}</p>
                <p className="text-white text-sm"><span className="text-green-400">Total Spend:</span> <span className="text-gold-400 font-bold">₹{selected.totalSpend.toLocaleString()}</span></p>
                <p className="text-white text-sm"><span className="text-green-400">Member Since:</span> {selected.joined}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
              {["orders","tickets"].map((t) => (
                <button key={t} onClick={() => setProfileTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    profileTab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
                  }`}>
                  {t === "orders" ? <span className="flex items-center gap-1"><ShoppingCart size={12} /> Order History</span>
                    : <span className="flex items-center gap-1"><MessageSquare size={12} /> Support Tickets</span>}
                </button>
              ))}
            </div>

            {profileTab === "orders" ? (
              <div className="space-y-2">
                {selected.orderHistory.length === 0 ? (
                  <p className="text-green-500 text-sm py-4 text-center">No orders yet</p>
                ) : selected.orderHistory.map((ordId) => (
                  <div key={ordId} className="flex items-center justify-between bg-green-800/50 rounded-xl px-4 py-3">
                    <span className="text-gold-400 text-sm font-medium">{ordId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {selected.tickets.length === 0 ? (
                  <p className="text-green-500 text-sm py-4 text-center">No support tickets</p>
                ) : selected.tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-green-800/50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-xs font-medium">{t.subject}</p>
                      <p className="text-green-500 text-xs">{t.date}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}