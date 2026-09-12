"use client";

import { useState } from "react";
import { Phone, Save, Store } from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [general, setGeneral] = useState({
    storeName: "Tharani Textiles",
    tagline: "Authentic Handloom & Ethnic Sarees",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "English",
    maintenanceMode: false,
  });
  const [contact, setContact] = useState({
    email: "admin@tharanitextiles.com",
    supportEmail: "support@tharanitextiles.com",
    phone: "+91 80001 23456",
    address: "42, Weaver Street, Komarapalayam, Tamil Nadu 638183",
    gstin: "33AABCT1234F1Z5",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General Store", icon: Store },
    { id: "contact", label: "Contact & Legal", icon: Phone },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2B27]">Store Settings</h1>
          <p className="text-sm text-[#7C7267] mt-0.5">
            Configure your store preferences, localized details and contact info
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave}>
            <Save size={15} /> {saved ? "Saved Successfully!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {saved && (
        <div className="bg-[#FAF3E0] border border-[#D4AF37] rounded-xl px-4 py-3 text-[#8C6D1F] text-sm font-semibold animate-fade-in shadow-sm">
          Settings updated and saved successfully.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#FAF6F0] border border-[#E8DCC8] p-1 rounded-xl w-fit max-w-full overflow-x-auto shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              tab === id
                ? "bg-[#D4AF37] text-[#2F2B27] shadow-sm"
                : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-white/60"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <section className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
            General Store Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              label="Store Name"
              id="storeName"
              value={general.storeName}
              onChange={(event) =>
                setGeneral({ ...general, storeName: event.target.value })
              }
            />
            <FormInput
              label="Tagline"
              id="tagline"
              value={general.tagline}
              onChange={(event) =>
                setGeneral({ ...general, tagline: event.target.value })
              }
            />
            <FormInput
              label="Default Currency"
              id="currency"
              type="select"
              value={general.currency}
              onChange={(event) =>
                setGeneral({ ...general, currency: event.target.value })
              }
              options={["INR", "USD", "EUR", "GBP"]}
            />
            <FormInput
              label="Timezone"
              id="timezone"
              type="select"
              value={general.timezone}
              onChange={(event) =>
                setGeneral({ ...general, timezone: event.target.value })
              }
              options={["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"]}
            />
            <FormInput
              label="Language"
              id="language"
              type="select"
              value={general.language}
              onChange={(event) =>
                setGeneral({ ...general, language: event.target.value })
              }
              options={["English", "Tamil", "Hindi", "Telugu"]}
            />
          </div>

          <div className="flex items-center justify-between gap-4 bg-[#FAF6F0] border border-[#E8DCC8] rounded-xl px-5 py-4">
            <div>
              <p className="text-[#2F2B27] text-sm font-bold">Maintenance Mode</p>
              <p className="text-[#7C7267] text-xs mt-0.5">
                Temporarily display a maintenance screen to storefront visitors
              </p>
            </div>
            <Toggle
              checked={general.maintenanceMode}
              onChange={(value) =>
                setGeneral({ ...general, maintenanceMode: value })
              }
            />
          </div>
        </section>
      )}

      {tab === "contact" && (
        <section className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
            Contact & Legal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              label="Admin Email"
              id="email"
              type="email"
              value={contact.email}
              onChange={(event) =>
                setContact({ ...contact, email: event.target.value })
              }
            />
            <FormInput
              label="Customer Support Email"
              id="supportEmail"
              type="email"
              value={contact.supportEmail}
              onChange={(event) =>
                setContact({ ...contact, supportEmail: event.target.value })
              }
            />
            <FormInput
              label="Support Phone"
              id="phone"
              value={contact.phone}
              onChange={(event) =>
                setContact({ ...contact, phone: event.target.value })
              }
            />
            <FormInput
              label="GSTIN / Tax ID"
              id="gstin"
              value={contact.gstin}
              onChange={(event) =>
                setContact({ ...contact, gstin: event.target.value })
              }
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Physical Store Address"
                id="address"
                type="textarea"
                value={contact.address}
                onChange={(event) =>
                  setContact({ ...contact, address: event.target.value })
                }
                rows={2}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
