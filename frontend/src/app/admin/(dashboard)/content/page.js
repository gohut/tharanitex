"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";

const emptyHero = {
  image: "",
  mobileImage: "",
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "",
  sortOrder: 1,
  isActive: true,
};

const emptyBanner = {
  image: "",
  mobileImage: "",
  title: "",
  subtitle: "",
  link: "",
  placement: "promo_1",
  sortOrder: 1,
  isActive: true,
};

const emptySettings = {
  categoriesTitle: "",
  categoriesSubtitle: "",
  whyTitle: "",
  whyHeading: "",
  whySubtitle: "",
  whyFeatures: [],
};

const emptyShowcase = {
  title: "",
  subtitle: "",
  productIds: [],
  rowCount: 1,
  sortOrder: 1,
  isActive: true,
  backgroundColor: "",
  backgroundImage: "",
};

export default function ContentPage() {
  const [tab, setTab] = useState("hero");

  const [heroSlides, setHeroSlides] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [settings, setSettings] = useState(emptySettings);

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [sections, setSections] = useState([]);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [showcaseSection, setShowcaseSection] = useState(null);
  const [showcaseForm, setShowcaseForm] = useState(emptyShowcase);
  const [products, setProducts] = useState([]);

  const [newSection, setNewSection] = useState({
    sectionType: "banner",
    referenceId: "",
  });

  useEffect(() => {
    loadHomepage();
    loadSections();
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts((data || []).filter((product) => product.isActive));
    } catch (error) {
      toast.error(error.message || "Failed to load products");
    }
  }

  async function loadHomepage() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/homepage", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load homepage content");
      }

      setHeroSlides(data.heroSlides || []);
      setPromoBanners(data.promoBanners || []);

      setSettings({
        ...emptySettings,
        ...(data.settings || {}),
        whyFeatures: data.settings?.whyFeatures || [],
      });
    } catch (error) {
      console.error("Homepage CMS load error:", error);
      toast.error(error.message || "Failed to load homepage CMS");
    } finally {
      setLoading(false);
    }
  }

  async function loadSections() {
    try {
      setLayoutLoading(true);

      const res = await fetch("/api/admin/homepage/sections", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load homepage layout");
      }

      setSections(data || []);
    } catch (error) {
      console.error("Homepage layout load error:", error);
      toast.error(error.message || "Failed to load homepage layout");
    } finally {
      setLayoutLoading(false);
    }
  }

  async function saveSectionOrder(updatedSections) {
    try {
      const res = await fetch("/api/admin/homepage/sections", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: updatedSections,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reorder homepage");
      }

      await loadSections();
    } catch (error) {
      console.error("Homepage reorder error:", error);
      toast.error(error.message || "Failed to reorder homepage");
      await loadSections();
    }
  }

  async function moveSection(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sections.length) {
      return;
    }

    const updated = [...sections];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];

    setSections(updated);
    await saveSectionOrder(updated);
  }

  async function toggleSection(section) {
    try {
      const res = await fetch(`/api/admin/homepage/sections/${section.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionType: section.sectionType,
          referenceId: section.referenceId,
          sortOrder: section.sortOrder,
          isActive: !Boolean(section.isActive),
          ...(section.sectionType === "product_showcase"
            ? {
                title: section.title,
                subtitle: section.subtitle,
                productIds: section.productIds,
                backgroundColor: section.backgroundColor,
                backgroundImage: section.backgroundImage,
                rowCount: section.rowCount ?? 1,
              }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update section");
      }

      await loadSections();
    } catch (error) {
      console.error("Section toggle error:", error);
      toast.error(error.message || "Failed to update section");
    }
  }

  async function removeSection(section) {
    try {
      const res = await fetch(`/api/admin/homepage/sections/${section.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove section");
      }

      toast.success("Section removed from homepage");
      await loadSections();
    } catch (error) {
      console.error("Section remove error:", error);
      toast.error(error.message || "Failed to remove section");
    }
  }

  async function addHomepageSection() {
    try {
      if (newSection.sectionType === "product_showcase") {
        setAddSectionOpen(false);
        setShowcaseSection(null);
        setShowcaseForm({ ...emptyShowcase, sortOrder: sections.length + 1 });
        setShowcaseOpen(true);
        return;
      }
      if (newSection.sectionType === "banner" && !newSection.referenceId) {
        toast.error("Select a banner");
        return;
      }

      const payload = {
        sectionType: newSection.sectionType,
        referenceId:
          newSection.sectionType === "banner"
            ? Number(newSection.referenceId)
            : null,
        sortOrder: sections.length + 1,
        isActive: true,
      };

      const res = await fetch("/api/admin/homepage/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add section");
      }

      toast.success("Section added to homepage");
      setAddSectionOpen(false);
      setNewSection({
        sectionType: "banner",
        referenceId: "",
      });
      await loadSections();
    } catch (error) {
      console.error("Add section error:", error);
      toast.error(error.message || "Failed to add section");
    }
  }

  function openEditShowcase(section) {
    setShowcaseSection(section);
    setShowcaseForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      productIds: section.productIds || [],
      rowCount: section.rowCount ?? 1,
      sortOrder: section.sortOrder ?? 1,
      isActive: Boolean(section.isActive),
      backgroundColor: section.backgroundColor || "",
      backgroundImage: section.backgroundImage || "",
    });
    setShowcaseOpen(true);
  }

  async function saveShowcase() {
    if (!showcaseForm.title.trim() || !showcaseForm.productIds.length) {
      toast.error("A title and at least one product are required");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(
        showcaseSection
          ? `/api/admin/homepage/sections/${showcaseSection.id}`
          : "/api/admin/homepage/sections",
        {
          method: showcaseSection ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...showcaseForm,
            sectionType: "product_showcase",
            referenceId: null,
            rowCount: Number(showcaseForm.rowCount) || 1,
            sortOrder: Number(showcaseForm.sortOrder) || sections.length + 1,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product section");
      toast.success(showcaseSection ? "Product section updated" : "Product section added");
      setShowcaseOpen(false);
      setShowcaseSection(null);
      await loadSections();
    } catch (error) {
      toast.error(error.message || "Failed to save product section");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file, folder) {
    if (!file) return null;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      return data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  function openAddHero() {
    setSelected(null);
    setForm({
      ...emptyHero,
      sortOrder: heroSlides.length + 1,
    });
    setModal("hero");
  }

  function openEditHero(slide) {
    setSelected(slide);
    setForm({
      image: slide.image || "",
      mobileImage: slide.mobileImage || "",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      sortOrder: slide.sortOrder ?? 1,
      isActive: Boolean(slide.isActive),
    });
    setModal("hero");
  }

  async function saveHero() {
    if (!form.image) {
      toast.error("Hero image is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: "hero",
        image: form.image,
        mobileImage: form.mobileImage || null,
        title: form.title || null,
        subtitle: form.subtitle || null,
        buttonText: form.buttonText || null,
        buttonLink: form.buttonLink || null,
        sortOrder: Number(form.sortOrder) || 1,
        isActive: Boolean(form.isActive),
      };

      const url = selected
        ? `/api/admin/homepage/hero/${selected.id}`
        : "/api/admin/homepage";

      const res = await fetch(url, {
        method: selected ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save hero slide");
      }

      toast.success(selected ? "Hero slide updated" : "Hero slide added");
      setModal(null);
      setSelected(null);
      await loadHomepage();
    } catch (error) {
      console.error("Hero save error:", error);
      toast.error(error.message || "Failed to save hero slide");
    } finally {
      setSaving(false);
    }
  }

  function openAddBanner() {
    setSelected(null);
    setForm({
      ...emptyBanner,
      sortOrder: promoBanners.length + 1,
    });
    setModal("banner");
  }

  function openEditBanner(banner) {
    setSelected(banner);
    setForm({
      image: banner.image || "",
      mobileImage: banner.mobileImage || "",
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      placement: banner.placement || "promo_1",
      sortOrder: banner.sortOrder ?? 1,
      isActive: Boolean(banner.isActive),
    });
    setModal("banner");
  }

  async function saveBanner() {
    if (!form.image) {
      toast.error("Banner image is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: "banner",
        image: form.image,
        mobileImage: form.mobileImage || "",
        title: form.title || null,
        subtitle: form.subtitle || null,
        link: form.link || null,
        placement: form.placement || "promo_1",
        sortOrder: Number(form.sortOrder) || 1,
        isActive: Boolean(form.isActive),
      };

      const url = selected
        ? `/api/admin/homepage/banner/${selected.id}`
        : "/api/admin/homepage";

      const res = await fetch(url, {
        method: selected ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save banner");
      }

      toast.success(selected ? "Banner updated" : "Banner added");
      setModal(null);
      setSelected(null);
      await loadHomepage();
    } catch (error) {
      console.error("Banner save error:", error);
      toast.error(error.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  }

  async function toggleItem(type, item) {
    try {
      const res = await fetch(`/api/admin/homepage/${type}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          isActive: !Boolean(item.isActive),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update content");
      }

      await loadHomepage();
    } catch (error) {
      console.error("Toggle content error:", error);
      toast.error(error.message || "Failed to update content");
    }
  }

  async function deleteItem() {
    if (!deleteTarget) return;

    try {
      setSaving(true);

      const res = await fetch(
        `/api/admin/homepage/${deleteTarget.type}/${deleteTarget.item.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete content");
      }

      toast.success("Content deleted");
      setDeleteTarget(null);
      await loadHomepage();
    } catch (error) {
      console.error("Delete content error:", error);
      toast.error(error.message || "Failed to delete content");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "settings",
          ...settings,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save homepage settings");
      }

      toast.success("Homepage content saved");
      await loadHomepage();
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error(error.message || "Failed to save homepage content");
    } finally {
      setSaving(false);
    }
  }

  function updateFeature(index, field, value) {
    setSettings((prev) => {
      const features = [...(prev.whyFeatures || [])];
      features[index] = {
        ...features[index],
        [field]: value,
      };
      return {
        ...prev,
        whyFeatures: features,
      };
    });
  }

  function addFeature() {
    setSettings((prev) => ({
      ...prev,
      whyFeatures: [
        ...(prev.whyFeatures || []),
        {
          title: "",
          description: "",
        },
      ],
    }));
  }

  function removeFeature(index) {
    setSettings((prev) => ({
      ...prev,
      whyFeatures: prev.whyFeatures.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2F2B27]">Store Content & CMS</h1>
        <p className="mt-0.5 text-sm text-[#7C7267]">
          Manage hero banners, promotional sections and homepage layout
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl bg-[#FAF6F0] border border-[#E8DCC8] p-1 shadow-sm">
        {[
          ["hero", "Hero Slides"],
          ["banners", "Promo Banners"],
          ["homepage", "Homepage Content"],
          ["layout", "Homepage Layout"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === value
                ? "bg-[#D4AF37] text-[#2F2B27] shadow-sm"
                : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* HERO SLIDES */}
      {tab === "hero" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddHero}>
              <Plus size={15} />
              Add Hero Slide
            </Button>
          </div>

          {heroSlides.length === 0 ? (
            <EmptyState text="No hero slides added yet." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {heroSlides.map((slide) => (
                <ContentCard
                  key={slide.id}
                  image={slide.image}
                  title={slide.title || "Hero Slide"}
                  subtitle={slide.subtitle}
                  order={slide.sortOrder}
                  active={Boolean(slide.isActive)}
                  onToggle={() => toggleItem("hero", slide)}
                  onEdit={() => openEditHero(slide)}
                  onDelete={() =>
                    setDeleteTarget({
                      type: "hero",
                      item: slide,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* BANNERS */}
      {tab === "banners" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddBanner}>
              <Plus size={15} />
              Add Banner
            </Button>
          </div>

          {promoBanners.length === 0 ? (
            <EmptyState text="No promotional banners added yet." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {promoBanners.map((banner) => (
                <ContentCard
                  key={banner.id}
                  image={banner.image}
                  title={
                    banner.title ||
                    (banner.placement === "promo_1"
                      ? "Promo Banner 1"
                      : banner.placement === "promo_2"
                      ? "Promo Banner 2"
                      : "Promotional Banner")
                  }
                  subtitle={banner.subtitle || banner.placement}
                  order={banner.sortOrder}
                  active={Boolean(banner.isActive)}
                  onToggle={() => toggleItem("banner", banner)}
                  onEdit={() => openEditBanner(banner)}
                  onDelete={() =>
                    setDeleteTarget({
                      type: "banner",
                      item: banner,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* HOMEPAGE SETTINGS */}
      {tab === "homepage" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#2F2B27]">
              Categories Section Header
            </h2>
            <p className="mt-1 text-xs text-[#7C7267]">
              Headings displayed above the homepage category cards
            </p>

            <div className="mt-5 space-y-4">
              <FormInput
                label="Section Title"
                id="categoriesTitle"
                value={settings.categoriesTitle || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categoriesTitle: e.target.value,
                  })
                }
              />

              <FormInput
                label="Section Subtitle"
                id="categoriesSubtitle"
                type="textarea"
                rows={3}
                value={settings.categoriesSubtitle || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    categoriesSubtitle: e.target.value,
                  })
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#2F2B27]">
              Why Tharani Heritage Section
            </h2>
            <p className="mt-1 text-xs text-[#7C7267]">
              Manage the brand heritage and authenticity block shown near the bottom of the homepage
            </p>

            <div className="mt-5 space-y-4">
              <FormInput
                label="Small Tagline Title"
                id="whyTitle"
                value={settings.whyTitle || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whyTitle: e.target.value,
                  })
                }
              />

              <FormInput
                label="Main Heading"
                id="whyHeading"
                value={settings.whyHeading || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whyHeading: e.target.value,
                  })
                }
              />

              <FormInput
                label="Subtitle Paragraph"
                id="whySubtitle"
                type="textarea"
                rows={3}
                value={settings.whySubtitle || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whySubtitle: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-7 border-t border-[#E8DCC8] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2F2B27]">
                    Brand Pillars / Features
                  </h3>
                  <p className="mt-0.5 text-xs text-[#7C7267]">
                    Example: Pure Silk, Silk Mark Certified, Direct Weavers
                  </p>
                </div>

                <Button variant="secondary" onClick={addFeature}>
                  <Plus size={14} />
                  Add Feature
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {(settings.whyFeatures || []).map((feature, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F]">
                        Feature {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <FormInput
                        label="Title"
                        id={`feature-title-${index}`}
                        value={feature.title || ""}
                        onChange={(e) =>
                          updateFeature(index, "title", e.target.value)
                        }
                      />

                      <FormInput
                        label="Description"
                        id={`feature-description-${index}`}
                        type="textarea"
                        rows={3}
                        value={feature.description || ""}
                        onChange={(e) =>
                          updateFeature(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Homepage Content"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* HOMEPAGE LAYOUT */}
      {tab === "layout" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2F2B27]">Homepage Layout</h2>
              <p className="mt-0.5 text-xs text-[#7C7267]">
                Control the order and visibility of homepage sections.
              </p>
            </div>

            <Button onClick={() => setAddSectionOpen(true)}>
              <Plus size={15} />
              Add Section
            </Button>
          </div>

          {layoutLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => {
                const labels = {
                  hero: "Hero Slider",
                  categories: "Categories",
                  banner:
                    section.bannerTitle ||
                    `Promo Banner #${section.referenceId}`,
                  new_arrivals: "New Arrivals",
                  best_sellers: "Best Sellers",
                  why_tharani: "Why Tharani",
                  product_showcase: section.title || "Product Showcase",
                };

                return (
                  <div
                    key={section.id}
                    className={`flex items-center gap-4 rounded-2xl border border-[#E8DCC8] bg-white p-4 shadow-sm transition ${
                      !section.isActive ? "opacity-60 bg-[#FAF6F0]" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E0] text-[#8C6D1F]">
                      <LayoutTemplate size={18} />
                    </div>

                    {section.sectionType === "banner" && section.bannerImage && (
                      <img
                        src={section.bannerImage}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-lg object-cover border border-[#E8DCC8]"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#2F2B27]">
                        {labels[section.sectionType] || section.sectionType}
                      </p>
                      <p className="mt-0.5 text-xs text-[#7C7267]">
                        Position {index + 1}
                        {section.sectionType === "banner" &&
                          ` · Banner ID ${section.referenceId}`}
                      </p>
                    </div>

                    <Toggle
                      checked={Boolean(section.isActive)}
                      onChange={() => toggleSection(section)}
                      label={section.isActive ? "Active" : "Inactive"}
                    />

                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSection(index, "up")}
                        className="rounded-lg bg-[#FAF6F0] border border-[#E8DCC8] p-2 text-[#2F2B27] transition hover:bg-[#FAF3E0] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(index, "down")}
                        className="rounded-lg bg-[#FAF6F0] border border-[#E8DCC8] p-2 text-[#2F2B27] transition hover:bg-[#FAF3E0] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown size={15} />
                      </button>

                      {section.sectionType === "product_showcase" && (
                        <button
                          type="button"
                          onClick={() => openEditShowcase(section)}
                          className="rounded-lg bg-[#FAF6F0] border border-[#E8DCC8] p-2 text-[#8C6D1F] transition hover:bg-[#FAF3E0]"
                          title="Edit product section"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeSection(section)}
                        className="rounded-lg bg-red-50 border border-red-200 p-2 text-red-600 transition hover:bg-red-100"
                        title="Remove from homepage"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HERO MODAL */}
      <Modal
        open={modal === "hero"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={selected ? "Edit Hero Slide" : "Add Hero Slide"}
        size="lg"
      >
        <div className="space-y-4">
          <ImageUpload
            image={form.image}
            uploading={uploading}
            onUpload={async (file) => {
              const url = await uploadImage(file, "homepage/hero");
              if (url) {
                setForm((prev) => ({
                  ...prev,
                  image: url,
                }));
              }
            }}
          />

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-[#2F2B27]">
              Mobile Hero Image (Optional)
            </label>
            <div className="overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#FAF6F0]">
              {form.mobileImage ? (
                <img
                  src={form.mobileImage}
                  alt="Mobile Hero Preview"
                  className="h-44 w-full object-contain bg-white"
                />
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-[#A89F91]">
                  <ImageIcon size={24} />
                  <span className="text-xs">No mobile image selected</span>
                </div>
              )}

              <div className="border-t border-[#E8DCC8] p-3 bg-white flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8DCC8] px-3.5 py-1.5 text-xs font-bold text-[#2F2B27] bg-[#FAF6F0] hover:bg-[#FAF3E0] transition">
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ImageIcon size={14} />
                  )}
                  {uploading
                    ? "Uploading..."
                    : form.mobileImage
                    ? "Replace Mobile Image"
                    : "Upload Mobile Image"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(
                          file,
                          "homepage/hero/mobile"
                        );
                        if (url) {
                          setForm((prev) => ({
                            ...prev,
                            mobileImage: url,
                          }));
                        }
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-[#7C7267]">Ratio: 4:3</span>
              </div>
            </div>
          </div>

          <FormInput
            label="Title"
            id="heroTitle"
            value={form.title || ""}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <FormInput
            label="Subtitle"
            id="heroSubtitle"
            type="textarea"
            rows={3}
            value={form.subtitle || ""}
            onChange={(e) =>
              setForm({
                ...form,
                subtitle: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormInput
              label="Button Text"
              id="heroButtonText"
              value={form.buttonText || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  buttonText: e.target.value,
                })
              }
            />

            <FormInput
              label="Button Link"
              id="heroButtonLink"
              value={form.buttonLink || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  buttonLink: e.target.value,
                })
              }
            />
          </div>

          <FormInput
            label="Display Order"
            id="heroOrder"
            type="number"
            value={form.sortOrder ?? 1}
            onChange={(e) =>
              setForm({
                ...form,
                sortOrder: Number(e.target.value),
              })
            }
          />

          <Toggle
            checked={Boolean(form.isActive)}
            onChange={(value) =>
              setForm({
                ...form,
                isActive: value,
              })
            }
            label="Active"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setModal(null);
              setSelected(null);
            }}
          >
            Cancel
          </Button>

          <Button onClick={saveHero} disabled={saving || uploading}>
            {saving ? "Saving..." : "Save Hero Slide"}
          </Button>
        </div>
      </Modal>

      {/* BANNER MODAL */}
      <Modal
        open={modal === "banner"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={selected ? "Edit Banner" : "Add Banner"}
        size="lg"
      >
        <div className="space-y-4">
          <ImageUpload
            image={form.image}
            uploading={uploading}
            onUpload={async (file) => {
              const url = await uploadImage(file, "homepage/banners");
              if (url) {
                setForm((prev) => ({
                  ...prev,
                  image: url,
                }));
              }
            }}
          />

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-[#2F2B27]">
              Mobile Banner Image (Optional)
            </label>
            <div className="overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#FAF6F0]">
              {form.mobileImage ? (
                <img
                  src={form.mobileImage}
                  alt="Mobile Banner Preview"
                  className="h-44 w-full object-contain bg-white"
                />
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-[#A89F91]">
                  <ImageIcon size={24} />
                  <span className="text-xs">No mobile image selected</span>
                </div>
              )}

              <div className="border-t border-[#E8DCC8] p-3 bg-white flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8DCC8] px-3.5 py-1.5 text-xs font-bold text-[#2F2B27] bg-[#FAF6F0] hover:bg-[#FAF3E0] transition">
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ImageIcon size={14} />
                  )}
                  {uploading
                    ? "Uploading..."
                    : form.mobileImage
                    ? "Replace Mobile Image"
                    : "Upload Mobile Image"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(
                          file,
                          "homepage/banners/mobile"
                        );
                        if (url) {
                          setForm((prev) => ({
                            ...prev,
                            mobileImage: url,
                          }));
                        }
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-[#7C7267]">Ratio: 4:3</span>
              </div>
            </div>
          </div>

          <FormInput
            label="Title"
            id="bannerTitle"
            value={form.title || ""}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <FormInput
            label="Subtitle"
            id="bannerSubtitle"
            type="textarea"
            rows={3}
            value={form.subtitle || ""}
            onChange={(e) =>
              setForm({
                ...form,
                subtitle: e.target.value,
              })
            }
          />

          <FormInput
            label="Link"
            id="bannerLink"
            value={form.link || ""}
            onChange={(e) =>
              setForm({
                ...form,
                link: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormInput
              label="Placement"
              id="bannerPlacement"
              type="select"
              value={form.placement || "promo_1"}
              onChange={(e) =>
                setForm({
                  ...form,
                  placement: e.target.value,
                })
              }
              options={["promo_1", "promo_2"]}
            />

            <FormInput
              label="Display Order"
              id="bannerOrder"
              type="number"
              value={form.sortOrder ?? 1}
              onChange={(e) =>
                setForm({
                  ...form,
                  sortOrder: Number(e.target.value),
                })
              }
            />
          </div>

          <Toggle
            checked={Boolean(form.isActive)}
            onChange={(value) =>
              setForm({
                ...form,
                isActive: value,
              })
            }
            label="Active"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setModal(null);
              setSelected(null);
            }}
          >
            Cancel
          </Button>

          <Button onClick={saveBanner} disabled={saving || uploading}>
            {saving ? "Saving..." : "Save Banner"}
          </Button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Content"
        size="sm"
      >
        <p className="text-sm leading-6 text-[#7C7267]">
          Are you sure you want to delete this content item? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>

          <Button variant="danger" onClick={deleteItem} disabled={saving}>
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* ADD SECTION MODAL */}
      <Modal
        open={addSectionOpen}
        onClose={() => setAddSectionOpen(false)}
        title="Add Homepage Section"
        size="md"
      >
        <div className="space-y-4">
          <FormInput
            label="Section Type"
            id="sectionType"
            type="select"
            value={newSection.sectionType}
            onChange={(e) =>
              setNewSection({
                sectionType: e.target.value,
                referenceId: "",
              })
            }
            options={[
              "banner",
              "hero",
              "categories",
              "new_arrivals",
              "best_sellers",
              "why_tharani",
              "product_showcase",
            ]}
          />

          {newSection.sectionType === "banner" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#2F2B27]">
                Select Banner
              </label>
              <select
                value={newSection.referenceId}
                onChange={(e) =>
                  setNewSection({
                    ...newSection,
                    referenceId: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E8DCC8] bg-white px-3.5 py-2.5 text-sm text-[#2F2B27] outline-none focus:border-[#D4AF37]"
              >
                <option value="">Select banner...</option>
                {promoBanners.map((banner) => (
                  <option key={banner.id} value={banner.id}>
                    {banner.title || `Promo Banner #${banner.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] p-4">
            <p className="text-xs leading-5 text-[#7C7267]">
              The new section will initially be added to the bottom of the homepage. Use the arrow buttons in Homepage Layout to adjust its position.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setAddSectionOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addHomepageSection}>Add Section</Button>
        </div>
      </Modal>

      {/* SHOWCASE MODAL */}
      <Modal
        open={showcaseOpen}
        onClose={() => {
          setShowcaseOpen(false);
          setShowcaseSection(null);
        }}
        title={
          showcaseSection
            ? "Edit Product Showcase Section"
            : "Add Product Showcase Section"
        }
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="Section Title"
            id="showcaseTitle"
            value={showcaseForm.title}
            onChange={(e) =>
              setShowcaseForm({ ...showcaseForm, title: e.target.value })
            }
          />

          <FormInput
            label="Subtitle / Description"
            id="showcaseSubtitle"
            type="textarea"
            rows={3}
            value={showcaseForm.subtitle}
            onChange={(e) =>
              setShowcaseForm({ ...showcaseForm, subtitle: e.target.value })
            }
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#2F2B27]">
              Select Products
            </label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] p-3">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-3 text-sm text-[#2F2B27] p-1.5 hover:bg-white rounded-lg transition"
                >
                  <input
                    type="checkbox"
                    checked={showcaseForm.productIds.includes(product.id)}
                    onChange={(e) =>
                      setShowcaseForm({
                        ...showcaseForm,
                        productIds: e.target.checked
                          ? [...showcaseForm.productIds, product.id]
                          : showcaseForm.productIds.filter(
                              (id) => id !== product.id
                            ),
                      })
                    }
                    className="accent-[#D4AF37] rounded"
                  />
                  <span className="font-medium">{product.name}</span>
                  <span className="ml-auto text-xs text-[#8C6D1F]">
                    {product.category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormInput
              label="Display Rows"
              id="showcaseRows"
              type="number"
              min={1}
              max={6}
              value={showcaseForm.rowCount ?? 1}
              onChange={(e) =>
                setShowcaseForm((prev) => ({
                  ...prev,
                  rowCount: Math.max(
                    1,
                    Math.min(6, Number(e.target.value) || 1)
                  ),
                }))
              }
            />

            <FormInput
              label="Display Order"
              id="showcaseOrder"
              type="number"
              value={showcaseForm.sortOrder}
              onChange={(e) =>
                setShowcaseForm({
                  ...showcaseForm,
                  sortOrder: Number(e.target.value),
                })
              }
            />
          </div>

          <ImageUpload
            image={showcaseForm.backgroundImage}
            uploading={uploading}
            onUpload={async (file) => {
              const url = await uploadImage(file, "homepage/product-showcases");
              if (url)
                setShowcaseForm((prev) => ({ ...prev, backgroundImage: url }));
            }}
          />

          <Toggle
            checked={Boolean(showcaseForm.isActive)}
            onChange={(value) =>
              setShowcaseForm({ ...showcaseForm, isActive: value })
            }
            label="Active"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowcaseOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveShowcase} disabled={saving}>
            {saving ? "Saving..." : "Save Section"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ContentCard({
  image,
  title,
  subtitle,
  order,
  active,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8DCC8] bg-white shadow-sm hover:shadow transition-shadow">
      <div className="relative">
        {image ? (
          <img src={image} alt={title} className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-[#FAF6F0] text-[#A89F91]">
            <ImageIcon size={32} />
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg bg-white/90 backdrop-blur-sm p-2 text-[#2F2B27] shadow-sm hover:bg-white transition"
            title={active ? "Deactivate" : "Activate"}
          >
            {active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-white/90 backdrop-blur-sm p-2 text-[#2F2B27] shadow-sm hover:bg-white transition"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-white/90 backdrop-blur-sm p-2 text-red-600 shadow-sm hover:bg-red-50 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2F2B27] shadow">
              Inactive
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#2F2B27]">{title}</p>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-[#7C7267]">{subtitle}</p>
            )}
          </div>

          <span className="shrink-0 text-xs font-bold text-[#8C6D1F] bg-[#FAF3E0] px-2 py-0.5 rounded-md border border-[#E8DCC8]">
            #{order}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E8DCC8]/60 flex items-center justify-between">
          <Toggle
            checked={active}
            onChange={onToggle}
            label={active ? "Active" : "Inactive"}
          />
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ image, uploading, onUpload }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#2F2B27]">
        Desktop Image
      </label>

      <div className="overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#FAF6F0]">
        {image ? (
          <img
            src={image}
            alt="Preview"
            className="h-44 w-full object-contain bg-white"
          />
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-2 text-[#A89F91]">
            <ImageIcon size={28} />
            <span className="text-xs">No image uploaded</span>
          </div>
        )}

        <div className="border-t border-[#E8DCC8] p-3 bg-white flex items-center justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8DCC8] px-3.5 py-1.5 text-xs font-bold text-[#2F2B27] bg-[#FAF6F0] hover:bg-[#FAF3E0] transition">
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ImageIcon size={14} />
            )}

            {uploading
              ? "Uploading..."
              : image
              ? "Replace Image"
              : "Upload Image"}

            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E8DCC8] bg-white px-6 py-12 text-center">
      <ImageIcon size={32} className="mx-auto text-[#A89F91]" />
      <p className="mt-3 text-sm text-[#7C7267] font-medium">{text}</p>
    </div>
  );
}
