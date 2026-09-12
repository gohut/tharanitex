"use client";

import { useState } from "react";
import { Phone, Save, Store, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [general, setGeneral] = useState({
    storeName: "Tharani Textiles",
    tagline: "Authentic Ethnic Wear for Every Occasion",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "English",
    maintenanceMode: false,
  });
  const [contact, setContact] = useState({
    email: "admin@tharanitextiles.com",
    supportEmail: "support@tharanitextiles.com",
    phone: "+91 80001 23456",
    address: "42, Commercial Street, Bangalore, Karnataka 560001",
    gstin: "29AABCT1234F1Z5",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-green-400 text-sm mt-0.5">Configure your store settings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} className={saved ? "!bg-green-600" : ""}>
            <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-800/50 border border-green-600 rounded-xl px-4 py-2.5 text-green-300 text-sm animate-fade-in">
          Settings saved successfully
        </div>
      )}

      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit max-w-full overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              tab === id ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <section className="bg-green-900 border border-green-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-5">
          <h2 className="text-white font-semibold border-b border-green-800 pb-3">General Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Store Name" id="storeName" value={general.storeName} onChange={(event) => setGeneral({ ...general, storeName: event.target.value })} />
            <FormInput label="Tagline" id="tagline" value={general.tagline} onChange={(event) => setGeneral({ ...general, tagline: event.target.value })} />
            <FormInput label="Currency" id="currency" type="select" value={general.currency} onChange={(event) => setGeneral({ ...general, currency: event.target.value })} options={["INR", "USD", "EUR", "GBP"]} />
            <FormInput label="Timezone" id="timezone" type="select" value={general.timezone} onChange={(event) => setGeneral({ ...general, timezone: event.target.value })} options={["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"]} />
            <FormInput label="Language" id="language" type="select" value={general.language} onChange={(event) => setGeneral({ ...general, language: event.target.value })} options={["English", "Hindi", "Tamil", "Telugu"]} />
          </div>
          <div className="flex items-center justify-between gap-4 bg-green-800/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-white text-sm font-medium">Maintenance Mode</p>
              <p className="text-green-400 text-xs">Temporarily disable the storefront for visitors</p>
            </div>
            <Toggle checked={general.maintenanceMode} onChange={(value) => setGeneral({ ...general, maintenanceMode: value })} />
          </div>
        </section>
      )}

      {tab === "contact" && (
        <section className="bg-green-900 border border-green-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-5">
          <h2 className="text-white font-semibold border-b border-green-800 pb-3">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Admin Email" id="email" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
            <FormInput label="Support Email" id="supportEmail" type="email" value={contact.supportEmail} onChange={(event) => setContact({ ...contact, supportEmail: event.target.value })} />
            <FormInput label="Phone" id="phone" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
            <FormInput label="GSTIN" id="gstin" value={contact.gstin} onChange={(event) => setContact({ ...contact, gstin: event.target.value })} />
            <div className="sm:col-span-2">
              <FormInput label="Store Address" id="address" type="textarea" value={contact.address} onChange={(event) => setContact({ ...contact, address: event.target.value })} rows={2} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
