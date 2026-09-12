"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, Star, Package, Upload } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 6;

function CategoryBlock({ category, products, openEditCat, openDeleteCat }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  const BLOCK_PAGE_SIZE = 10;
  const filteredProducts = products.filter(
    (p) =>
      p.category === category.name &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / BLOCK_PAGE_SIZE));
  const paginated = viewAll
    ? filteredProducts
    : filteredProducts.slice((page - 1) * BLOCK_PAGE_SIZE, page * BLOCK_PAGE_SIZE);

  return (
    <div className="w-full mb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[#2F2B27] text-lg font-bold font-sans">{category.name}</h2>
          <button onClick={() => openEditCat(category)} className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3E0] text-[#5A1F2F] border border-[#E8DCC8] hover:border-[#D4AF37] transition-colors cursor-pointer">
            <Edit2 size={13} />
          </button>
          <button onClick={() => openDeleteCat(category)} className="p-2 rounded-xl bg-[#FDEEEC] hover:bg-[#F8BDB8] text-[#C5221F] border border-[#F8BDB8] transition-colors cursor-pointer">
            <Trash2 size={13} />
          </button>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={`Search in ${category.name}...`}
            className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#8A8175] text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {paginated.length > 0 ? (
          paginated.map((p) => (
            <div key={p.id} className="bg-white border border-[#E8DCC8] rounded-2xl overflow-hidden hover:border-[#D4AF37] transition-all shadow-xs group">
              <div className="aspect-square bg-[#FAF6F0] relative overflow-hidden">
                <img src={p.image || "/assets/saree.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = "https://placehold.co/400x400/5A1F2F/D4AF37?text=Img"; }} />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star size={10} className="text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-white text-[10px] font-bold">{p.rating}</span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <p className="text-[#2F2B27] text-sm font-bold font-sans truncate mb-1">{p.name}</p>
                <p className="text-[#8C6D1F] font-bold text-sm font-sans">₹{p.price.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-[#7C7267] text-sm font-sans">
            <Package size={24} className="mx-auto mb-2 opacity-50 text-[#8C6D1F]" />
            No products found in this category.
          </div>
        )}
      </div>

      {filteredProducts.length > BLOCK_PAGE_SIZE && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8DCC8] pt-4 font-sans">
          <p className="text-[#7C7267] text-xs">
            Showing {viewAll ? filteredProducts.length : paginated.length} of {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setViewAll(!viewAll)} className="text-xs py-1.5 px-3">
              {viewAll ? "Paginate" : "View All"}
            </Button>
            {!viewAll && (
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete" | "addCat" | "editCat" | "deleteCat" | "reviews"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [catForm, setCatForm] = useState({});
  const [catError, setCatError] = useState("");
  const [catUploading, setCatUploading] = useState(false);

  const loadData = useCallback(async () => {
      try {
        setLoading(true);

        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);

        if (!productsRes.ok) {
          throw new Error("Failed to load products");
        }

        if (!categoriesRes.ok) {
          throw new Error("Failed to load categories");
        }

        const [data, categoryData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        const formattedProducts = data.map((product) => ({
          ...product,

          price: Number(product.price),
          stock: Number(product.stock),

          status:
            product.isActive === 0 || product.isActive === false
              ? "Inactive"
              : Number(product.stock) === 0
              ? "Out of Stock"
              : Number(product.stock) <= 5
                ? "Low Stock"
                : "Active",

          rating: 0,
          reviews: 0,
        }));

        setProducts(formattedProducts);
        setCategories(categoryData);
      } catch (error) {
        console.error("Admin products load error:", error);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);

        if (!productsRes.ok) {
          throw new Error("Failed to load products");
        }

        if (!categoriesRes.ok) {
          throw new Error("Failed to load categories");
        }

        const [data, categoryData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        const formattedProducts = data.map((product) => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock),
          status:
            product.isActive === 0 || product.isActive === false
              ? "Inactive"
              : Number(product.stock) === 0
              ? "Out of Stock"
              : Number(product.stock) <= 5
                ? "Low Stock"
                : "Active",
          rating: 0,
          reviews: 0,
        }));

        if (!ignore) {
          setProducts(formattedProducts);
          setCategories(categoryData);
        }
      } catch (error) {
        console.error("Admin products load error:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  // ––– Filtered Products –––
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // â”€â”€ Product CRUD â”€â”€
  const openAdd = () => {
    setForm({ name: "", description: "", price: "", stock: "", category: categories[0]?.name || "", subcategory: "", status: "Active" });
    setIsAddingProduct(true);
  };
  const closeAdd = () => setIsAddingProduct(false);
  const openEdit = (p) => {
    setForm({ ...p });
    setSelected(p);
    setModal("edit");
  };
  const openDelete = (p) => { setSelected(p); setModal("delete"); };
  const openReviews = (p) => { setSelected(p); setModal("reviews"); };

  const saveProduct = () => {
    if (modal === "add") {
      setProducts([...products, { ...form, id: `P${Date.now()}`, price: Number(form.price), stock: Number(form.stock), rating: 0, reviews: 0, variants: [], image: "https://placehold.co/80x80/145C3E/D4AF37?text=New" }]);
    } else {
      setProducts(products.map((p) => (p.id === selected.id ? { ...selected, ...form, price: Number(form.price), stock: Number(form.stock) } : p)));
    }
    setModal(null);
  };
  const deleteProduct = () => {
    setProducts(products.filter((p) => p.id !== selected.id));
    setModal(null);
  };

  // â”€â”€ Category CRUD â”€â”€
  const openAddCat = () => {
    setCatError("");
    setCatForm({
      name: "",
      subtitle: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
    });
    setModal("addCat");
  };
  const openEditCat = (c) => {
    setCatError("");
    setCatForm({
      name: c.name || "",
      subtitle: c.subtitle || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
      isActive: c.isActive !== false && c.isActive !== 0,
    });
    setSelected(c);
    setModal("editCat");
  };
  const openDeleteCat = (c) => {
    setCatError("");
    setSelected(c);
    setModal("deleteCat");
  };

  const handleCategoryImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCatUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      setCatForm((prev) => ({ ...prev, image: data.url }));
    } catch (error) {
      setCatError(error.message || "Image upload failed");
    } finally {
      setCatUploading(false);
      event.target.value = "";
    }
  };

  const saveCat = async () => {
    try {
      setCatError("");

      const endpoint =
        modal === "editCat"
          ? `/api/admin/categories/${selected.id}`
          : "/api/admin/categories";

      const res = await fetch(endpoint, {
        method: modal === "editCat" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      await loadData();
      setModal(null);
    } catch (error) {
      setCatError(error.message || "Failed to save category");
    }
  };

  const deleteCat = async () => {
    try {
      setCatError("");

      const res = await fetch(`/api/admin/categories/${selected.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      await loadData();
      setModal(null);
    } catch (error) {
      setCatError(error.message || "Failed to delete category");
    }
  };

  const uniqueCategories = ["All", ...categories.map((category) => category.name)];

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[#2F2B27] text-2xl font-bold font-sans tracking-tight">Products</h1>
          <p className="text-[#7C7267] text-sm mt-0.5 font-sans">Manage your product catalog</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E8DCC8] p-1 rounded-xl w-fit shadow-xs">
        {["products", "categories"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all font-sans cursor-pointer ${
              tab === t ? "bg-[#D4AF37] text-[#2F2B27] shadow-xs" : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-[#FAF6F0]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C7267]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#8A8175] text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-sans"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-white border border-[#E8DCC8] text-[#2F2B27] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] font-sans cursor-pointer"
            >
              {["All", "Active", "Low Stock", "Out of Stock", "Inactive"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="bg-white border border-[#E8DCC8] text-[#2F2B27] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] font-sans cursor-pointer"
            >
              {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Button onClick={() => router.push("/admin/products/add")} variant="primary" className="ml-auto">
              <Plus size={14} /> Add Product
            </Button>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="bg-[#FAF3E0] border-b border-[#E8DCC8]">
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans">Product</th>
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider hidden sm:table-cell font-sans">Category</th>
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans">Price</th>
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans">Stock</th>
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans">Status</th>
                    <th className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[#7C7267] font-sans">
                        <Package size={32} className="mx-auto mb-2 opacity-40 text-[#8C6D1F]" />
                        No products found
                      </td>
                    </tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id} onClick={() => router.push(`/admin/products/add?id=${p.id}`)} className="hover:bg-[#FDFBF7] transition-colors cursor-pointer font-sans">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image || "/assets/saree.png"} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E8DCC8]" onError={(e) => { e.target.src = p.image; }} />
                          <div className="min-w-0">
                            <p className="text-[#2F2B27] text-sm font-bold truncate font-sans">{p.name}</p>
                            <p className="text-[#8C6D1F] text-xs truncate font-sans">ID: {p.id}</p>
                            <p className="text-[#7C7267] text-xs sm:hidden truncate mt-0.5 font-sans">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#5C544B] text-xs hidden sm:table-cell font-sans">{p.category}</td>
                      <td className="px-5 py-3.5 text-[#2F2B27] text-xs font-bold font-sans">₹{p.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[#5C544B] text-xs font-sans">{p.stock}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                          <span className="text-[#7C7267] text-xs font-semibold font-sans">{p.rating} ({p.reviews})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3.5 border-t border-[#E8DCC8] bg-[#FDFBF7] flex items-center justify-between font-sans">
              <p className="text-[#7C7267] text-xs font-sans">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          </div>
        </>
      ) : (
        /* Categories Tab */
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={openAddCat}><Plus size={14} /> Add Category</Button>
          </div>
          <div className="space-y-6">
            {categories.map((c) => (
              <CategoryBlock
                key={c.id}
                category={c}
                products={products}
                openEditCat={openEditCat}
                openDeleteCat={openDeleteCat}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}

      {/* Add/Edit Product */}
      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "add" ? "Add Product" : "Edit Product"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Product Name" id="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" required />
          <FormInput label="Category" id="category" type="select" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories.map((c) => c.name)} />
          <FormInput label="Subcategory" id="subcategory" value={form.subcategory || ""} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="e.g. Silk, Bridal" />
          <FormInput label="Price (₹)" id="price" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" required />
          <FormInput label="Stock Quantity" id="stock" type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" required />
          <FormInput label="Status" id="status" type="select" value={form.status || "Active"} onChange={(e) => setForm({ ...form, status: e.target.value })} options={["Active", "Low Stock", "Out of Stock"]} />
          <div className="sm:col-span-2">
            <FormInput
              label="Subtitle"
              id="catsubtitle"
              value={catForm.subtitle || ""}
              onChange={(e) =>
                setCatForm({ ...catForm, subtitle: e.target.value })
              }
              placeholder="e.g. SILKS"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveProduct}>{modal === "add" ? "Add Product" : "Save Changes"}</Button>
        </div>
      </Modal>

      {/* Delete Product */}
      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Delete Product" size="sm">
        <p className="text-[#5C544B] text-sm mb-2 font-sans">Are you sure you want to delete</p>
        <p className="text-[#2F2B27] font-bold text-base mb-2 font-sans">{selected?.name}?</p>
        <p className="text-[#7C7267] text-xs mb-5 font-sans">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={deleteProduct}>Delete</Button>
        </div>
      </Modal>

      {/* Reviews Modal */}
      <Modal open={modal === "reviews"} onClose={() => setModal(null)} title={`Reviews — ${selected?.name}`} size="lg">
        <div className="space-y-3 font-sans">
          {selected?.reviews > 0 ? (
            <p className="text-[#5C544B] text-sm font-sans">
              {selected.reviews} reviews · Avg {selected.rating}★
            </p>
          ) : (
            <p className="text-[#7C7267] text-sm font-sans">
              No reviews yet for this product.
            </p>
          )}
          <div className="flex items-center gap-2 py-4 font-sans">
            {[1,2,3,4,5].map((s) => <Star key={s} size={20} className={s <= Math.round(selected?.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#E8DCC8]"} />)}
            <span className="text-[#2F2B27] font-bold ml-1 font-sans">{selected?.rating}</span>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Category */}
      <Modal open={modal === "addCat" || modal === "editCat"} onClose={() => setModal(null)} title={modal === "addCat" ? "Add Category" : "Edit Category"} size="md">
        <div className="space-y-4 font-sans">
          <FormInput label="Category Name" id="catname" value={catForm.name || ""} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Sarees" required />
          <FormInput label="Slug" id="catslug" value={catForm.slug || ""} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="Generated from name if blank" />
          <FormInput label="Subtitle" id="catsubtitle" value={catForm.subtitle || ""} onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })} placeholder="e.g. SILKS" />
          <FormInput label="Description" id="catdesc" type="textarea" value={catForm.description || ""} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3} placeholder="Category description..." />
          <div>
            <label className="text-[#2F2B27] text-xs font-semibold font-sans">Category Image</label>
            <div className="mt-2 flex items-center gap-3 font-sans">
              {catForm.image && (
                <img src={catForm.image} alt={catForm.name || "Category"} className="h-20 w-20 rounded-xl object-cover border border-[#E8DCC8]" />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] px-3.5 py-2 text-sm font-semibold text-[#5A1F2F] hover:bg-[#FAF3E0] hover:border-[#D4AF37] transition shadow-xs">
                <Upload size={14} className="text-[#8C6D1F]" />
                {catUploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCategoryImage} className="hidden" disabled={catUploading} />
              </label>
            </div>
          </div>
          <Toggle checked={!!catForm.isActive} onChange={(value) => setCatForm({ ...catForm, isActive: value })} label="Active" />
          {catError && <p className="text-sm text-[#C5221F] font-medium font-sans">{catError}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-[#E8DCC8]">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" onClick={saveCat}>{modal === "addCat" ? "Add Category" : "Save Changes"}</Button>
        </div>
      </Modal>

      {/* Delete Category */}
      <Modal open={modal === "deleteCat"} onClose={() => setModal(null)} title="Delete Category" size="sm">
        <p className="text-[#5C544B] text-sm mb-2 font-sans">Delete category <span className="text-[#2F2B27] font-bold">{selected?.name}</span>?</p>
        <p className="text-[#7C7267] text-xs font-sans">Categories with assigned products cannot be deleted.</p>
        {catError && <p className="mt-3 text-sm text-[#C5221F] font-medium font-sans">{catError}</p>}
        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-[#E8DCC8]">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={deleteCat}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

