"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Palette, Phone, RotateCcw, Save, Store, Upload } from "lucide-react";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import Toggle from "../../../components/ui/Toggle";
import {
  applyBrandingTheme,
  BRANDING_STORAGE_KEY,
  DEFAULT_BRANDING_THEME,
  getSavedBrandingTheme,
} from "../../../lib/theme";

const COLOR_GROUPS = [
  {
    title: "Brand & Background",
    description: "Main surfaces used by the storefront and admin screens.",
    colors: [
      { key: "primaryColor", label: "Primary Background", usage: "Deep page and sidebar base" },
      { key: "secondaryColor", label: "Secondary Background", usage: "Navigation and large panels" },
      { key: "surfaceColor", label: "Surface Color", usage: "Inputs, buttons, and raised controls" },
      { key: "surfaceHoverColor", label: "Hover Surface", usage: "Hover states and selected surface accents" },
      { key: "pageBackgroundColor", label: "Page Background", usage: "Admin content background" },
      { key: "elevatedBackgroundColor", label: "Elevated Background", usage: "Deep overlays and inactive surfaces" },
    ],
  },
  {
    title: "Text & Accent",
    description: "Major text, minor text, muted text, and brand accent colors.",
    colors: [
      { key: "majorTextColor", label: "Major Text Color", usage: "Headings and primary content" },
      { key: "minorTextColor", label: "Minor Text Color", usage: "Section labels and supporting copy" },
      { key: "softTextColor", label: "Soft Text Color", usage: "Secondary details" },
      { key: "mutedTextColor", label: "Muted Text Color", usage: "Counts, placeholders, and empty states" },
      { key: "accentColor", label: "Accent Color", usage: "Primary buttons, highlights, and links" },
      { key: "accentHoverColor", label: "Accent Hover Color", usage: "Accent hover states" },
      { key: "accentTextColor", label: "Accent Text Color", usage: "Text placed on accent buttons" },
    ],
  },
  {
    title: "Borders & Status",
    description: "Structural borders and the colors used by badges, alerts, and status actions.",
    colors: [
      { key: "borderColor", label: "Border Color", usage: "Default panel and table borders" },
      { key: "strongBorderColor", label: "Strong Border Color", usage: "Focused or emphasized borders" },
      { key: "successColor", label: "Success Color", usage: "Success badges and saved states" },
      { key: "infoColor", label: "Info Color", usage: "Shipping, packed, and informational states" },
      { key: "warningColor", label: "Warning Color", usage: "Pending and attention states" },
      { key: "dangerColor", label: "Danger Color", usage: "Cancel, reject, and error states" },
      { key: "purpleColor", label: "Purple Status Color", usage: "Refunded, returned, and VIP accents" },
      { key: "orangeColor", label: "Orange Status Color", usage: "Flagged and review-warning states" },
      { key: "neutralColor", label: "Neutral Status Color", usage: "Draft and inactive states" },
    ],
  },
];

function ColorField({ color, label, usage, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-green-800 bg-green-950/35 px-3 py-3">
      <span
        className="h-10 w-10 shrink-0 rounded-lg border border-green-700 shadow-card"
        style={{ backgroundColor: value }}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-white text-sm font-semibold">{label}</span>
        <span className="block text-green-400 text-xs leading-snug">{usage}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(color, event.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-green-700 bg-transparent"
          aria-label={label}
        />
        <span className="hidden w-20 text-right font-mono text-xs text-green-300 sm:inline">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

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
    email: "admin@aeux.com",
    supportEmail: "support@aeux.com",
    phone: "+91 80001 23456",
    address: "42, Commercial Street, Bangalore, Karnataka 560001",
    gstin: "29AABCT1234F1Z5",
  });
  const [branding, setBranding] = useState(DEFAULT_BRANDING_THEME);

  useEffect(() => {
    const savedBranding = getSavedBrandingTheme();
    setBranding(savedBranding);
    applyBrandingTheme(savedBranding);
  }, []);

  useEffect(() => {
    applyBrandingTheme(branding);
  }, [branding]);

  const colorCount = useMemo(
    () => COLOR_GROUPS.reduce((count, group) => count + group.colors.length, 0),
    []
  );

  const updateBranding = (key, value) => {
    setBranding((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
    applyBrandingTheme(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING_THEME);
    localStorage.removeItem(BRANDING_STORAGE_KEY);
    applyBrandingTheme(DEFAULT_BRANDING_THEME);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-green-400 text-sm mt-0.5">Configure your store settings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === "branding" && (
            <Button variant="secondary" onClick={resetBranding}>
              <RotateCcw size={14} /> Reset Theme
            </Button>
          )}
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

      {tab === "branding" && (
        <div className="space-y-5">
          <section className="bg-green-900 border border-green-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-white font-semibold">Branding</h2>
                <p className="text-green-400 text-sm mt-1">
                  Edit {colorCount} theme colors. Changes preview instantly and become permanent after Save Changes.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-green-800 bg-green-950/35 px-3 py-2 text-green-300 text-xs">
                <Eye size={14} className="text-gold-400" /> Live preview active
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
              <div className="space-y-2">
                <p className="text-green-300 text-xs font-medium">Store Logo</p>
                <div className="border-2 border-dashed border-green-700 rounded-xl p-8 text-center hover:border-gold-600 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto mb-2 text-green-500" />
                  <p className="text-green-400 text-sm">Click to upload logo</p>
                  <p className="text-green-600 text-xs mt-1">PNG, SVG up to 2MB</p>
                </div>
              </div>

              <div className="rounded-xl border border-green-800 bg-green-950/35 p-4">
                <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Theme Preview</p>
                <div className="mt-3 rounded-xl border border-green-800 bg-green-900 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-semibold">Tharani Textiles</p>
                      <p className="text-green-400 text-xs">Major and minor text preview</p>
                    </div>
                    <span className="rounded-lg bg-gold-600 px-3 py-1.5 text-green-950 text-xs font-semibold">
                      Accent
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {["successColor", "infoColor", "warningColor", "dangerColor"].map((key) => (
                      <span
                        key={key}
                        className="h-8 rounded-lg border border-green-800"
                        style={{ backgroundColor: branding[key] }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {COLOR_GROUPS.map((group) => (
            <section key={group.title} className="bg-green-900 border border-green-800 rounded-2xl p-5 sm:p-6 shadow-card">
              <div className="mb-4 border-b border-green-800 pb-3">
                <h3 className="text-white font-semibold">{group.title}</h3>
                <p className="text-green-400 text-sm mt-1">{group.description}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {group.colors.map((item) => (
                  <ColorField
                    key={item.key}
                    color={item.key}
                    label={item.label}
                    usage={item.usage}
                    value={branding[item.key]}
                    onChange={updateBranding}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="bg-green-900 border border-green-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-5">
            <div className="border-b border-green-800 pb-3">
              <h3 className="text-white font-semibold">Brand Links</h3>
              <p className="text-green-400 text-sm mt-1">Social and asset URLs used by the brand profile.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Logo URL" id="logoUrl" value={branding.logoUrl} onChange={(event) => updateBranding("logoUrl", event.target.value)} placeholder="https://..." />
              <FormInput label="Favicon URL" id="faviconUrl" value={branding.faviconUrl} onChange={(event) => updateBranding("faviconUrl", event.target.value)} placeholder="https://..." />
              <FormInput label="Facebook" id="fb" value={branding.socialFacebook} onChange={(event) => updateBranding("socialFacebook", event.target.value)} />
              <FormInput label="Instagram" id="ig" value={branding.socialInstagram} onChange={(event) => updateBranding("socialInstagram", event.target.value)} />
              <FormInput label="Twitter / X" id="tw" value={branding.socialTwitter} onChange={(event) => updateBranding("socialTwitter", event.target.value)} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
