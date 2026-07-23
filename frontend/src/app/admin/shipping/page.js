"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Truck, Package, MapPin, Users } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import Toggle from "../../../components/ui/Toggle";
import { shippingZones as initZones, couriers as initCouriers, trackingUpdates, deliveryPartners as initPartners } from "../../../data/shipping";

export default function ShippingPage() {
  const [zones, setZones] = useState(initZones);
  const [couriers, setCouriers] = useState(initCouriers);
  const [partners, setPartners] = useState(initPartners);
  const [tab, setTab] = useState("zones");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const tabs = ["zones", "couriers", "tracking", "partners"];

  const openAddZone = () => { setForm({ name:"", states:"", baseRate:"", perKgRate:"", freeShippingAbove:"", estimatedDays:"" }); setModal("addZone"); };
  const openEditZone = (z) => { setForm({ ...z, states: z.states.join(", ") }); setSelected(z); setModal("editZone"); };
  const saveZone = () => {
    const zone = { ...form, states: form.states.split(",").map((s) => s.trim()), baseRate: Number(form.baseRate), perKgRate: Number(form.perKgRate), freeShippingAbove: Number(form.freeShippingAbove) };
    if (modal === "addZone") setZones([...zones, { id: `Z${Date.now()}`, ...zone }]);
    else setZones(zones.map((z) => z.id === selected.id ? { ...z, ...zone } : z));
    setModal(null);
  };
  const deleteZone = (id) => setZones(zones.filter((z) => z.id !== id));

  const toggleCourier = (id) => setCouriers(couriers.map((c) => c.id === id ? { ...c, status: !c.status } : c));

  const openAddPartner = () => { setForm({ name:"", contact:"", phone:"", activeZones:"", status:"Active" }); setModal("addPartner"); };
  const savePartner = () => {
    if (modal === "addPartner") setPartners([...partners, { id: `DP${Date.now()}`, ...form, activeZones: Number(form.activeZones) }]);
    else setPartners(partners.map((p) => p.id === selected.id ? { ...p, ...form } : p));
    setModal(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Shipping & Delivery</h1>
        <p className="text-green-400 text-sm mt-0.5">Manage shipping zones, couriers, and tracking</p>
      </div>

      <div className="flex gap-1 flex-wrap bg-green-900 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}>
            {t === "zones" ? "Zones & Rates" : t === "couriers" ? "Courier Integrations" : t === "tracking" ? "Tracking Updates" : "Delivery Partners"}
          </button>
        ))}
      </div>

      {/* Zones Tab */}
      {tab === "zones" && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={openAddZone}><Plus size={14} /> Add Zone</Button></div>
          {zones.map((z) => (
            <div key={z.id} className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-white font-semibold">{z.name}</p>
                  <p className="text-green-400 text-xs mt-0.5">{z.estimatedDays} business days</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditZone(z)} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => deleteZone(z.id)} className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-green-800/50 rounded-xl p-3">
                  <p className="text-green-400 text-xs">Base Rate</p>
                  <p className="text-white font-semibold">₹{z.baseRate}</p>
                </div>
                <div className="bg-green-800/50 rounded-xl p-3">
                  <p className="text-green-400 text-xs">Per KG</p>
                  <p className="text-white font-semibold">₹{z.perKgRate}</p>
                </div>
                <div className="bg-green-800/50 rounded-xl p-3">
                  <p className="text-green-400 text-xs">Free Shipping Above</p>
                  <p className="text-white font-semibold">₹{z.freeShippingAbove}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {z.states.map((s) => <span key={s} className="px-2 py-0.5 bg-green-800 text-green-300 text-xs rounded-full border border-green-700">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Couriers Tab */}
      {tab === "couriers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {couriers.map((c) => (
            <div key={c.id} className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-800 flex items-center justify-center">
                    <Truck size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <p className="text-green-400 text-xs">{c.coverage}</p>
                  </div>
                </div>
                <Toggle checked={c.status} onChange={() => toggleCourier(c.id)} />
              </div>
              <div className="space-y-1">
                <p className="text-green-400 text-xs">Avg: <span className="text-white">{c.avgDeliveryDays} days</span></p>
                <p className="text-green-400 text-xs">Tracking: <span className={c.trackingSupport ? "text-green-400" : "text-red-400"}>{c.trackingSupport ? "Supported" : "Not Supported"}</span></p>
              </div>
              <div className="mt-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                  c.status ? "bg-green-900/50 text-green-300 border-green-700" : "bg-gray-800 text-gray-400 border-gray-700"
                }`}>{c.status ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Tab */}
      {tab === "tracking" && (
        <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-800">
                  {["Order ID","Courier","Tracking ID","Status","Location","Last Update"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trackingUpdates.map((t) => (
                  <tr key={t.id} className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors">
                    <td className="px-4 py-3 text-gold-400 text-xs font-medium">{t.orderId}</td>
                    <td className="px-4 py-3 text-white text-xs">{t.courier}</td>
                    <td className="px-4 py-3 text-green-300 text-xs">{t.id}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status === "Delivered" ? "Delivered" : t.status === "Out for Delivery" ? "Shipped" : "Pending"} /></td>
                    <td className="px-4 py-3 text-green-300 text-xs">{t.location}</td>
                    <td className="px-4 py-3 text-green-500 text-xs">{t.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partners Tab */}
      {tab === "partners" && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={openAddPartner}><Plus size={14} /> Add Partner</Button></div>
          {partners.map((p) => (
            <div key={p.id} className="bg-green-900 border border-green-800 rounded-2xl p-5 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-800 flex items-center justify-center">
                  <Users size={18} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-green-400 text-xs">{p.contact} · {p.phone}</p>
                  <p className="text-green-500 text-xs">{p.activeZones} active zone{p.activeZones !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <button onClick={() => { setSelected(p); setForm({ ...p }); setModal("editPartner"); }} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"><Edit2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone Modal */}
      <Modal open={modal === "addZone" || modal === "editZone"} onClose={() => setModal(null)} title={modal === "addZone" ? "Add Shipping Zone" : "Edit Shipping Zone"} size="md">
        <div className="space-y-4">
          <FormInput label="Zone Name" id="zoneName" value={form.name||""} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="e.g. Metro Cities" />
          <FormInput label="States / Countries (comma separated)" id="states" value={form.states||""} onChange={(e) => setForm({...form,states:e.target.value})} placeholder="Maharashtra, Karnataka" />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Base Rate (₹)" id="baseRate" type="number" value={form.baseRate||""} onChange={(e) => setForm({...form,baseRate:e.target.value})} placeholder="50" />
            <FormInput label="Per KG Rate (₹)" id="perKg" type="number" value={form.perKgRate||""} onChange={(e) => setForm({...form,perKgRate:e.target.value})} placeholder="20" />
            <FormInput label="Free Shipping Above (₹)" id="freeShip" type="number" value={form.freeShippingAbove||""} onChange={(e) => setForm({...form,freeShippingAbove:e.target.value})} placeholder="999" />
            <FormInput label="Est. Days" id="estDays" value={form.estimatedDays||""} onChange={(e) => setForm({...form,estimatedDays:e.target.value})} placeholder="1-2" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveZone}>Save Zone</Button>
        </div>
      </Modal>

      {/* Partner Modal */}
      <Modal open={modal === "addPartner" || modal === "editPartner"} onClose={() => setModal(null)} title={modal === "addPartner" ? "Add Partner" : "Edit Partner"} size="sm">
        <div className="space-y-4">
          <FormInput label="Partner Name" id="pname" value={form.name||""} onChange={(e) => setForm({...form,name:e.target.value})} />
          <FormInput label="Contact Email" id="pcontact" value={form.contact||""} onChange={(e) => setForm({...form,contact:e.target.value})} />
          <FormInput label="Phone" id="pphone" value={form.phone||""} onChange={(e) => setForm({...form,phone:e.target.value})} />
          <FormInput label="Active Zones" id="pzones" type="number" value={form.activeZones||""} onChange={(e) => setForm({...form,activeZones:e.target.value})} />
          <FormInput label="Status" id="pstatus" type="select" value={form.status||"Active"} onChange={(e) => setForm({...form,status:e.target.value})} options={["Active","Inactive"]} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={savePartner}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}