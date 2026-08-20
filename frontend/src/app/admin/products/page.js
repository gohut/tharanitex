"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, Star, Package, Upload } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import Toggle from "../../../components/ui/Toggle";
import Pagination from "../../../components/ui/Pagination";

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
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-bold">{category.name}</h2>
          <button onClick={() => openEditCat(category)} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => openDeleteCat(category)} className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={`Search in ${category.name}...`}
            className="w-full bg-green-950 border border-green-800 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {paginated.length > 0 ? (
          paginated.map((p) => (
            <div key={p.id} className="bg-green-950/50 border border-green-800 rounded-xl overflow-hidden hover:border-gold-500/50 transition-colors group">
              <div className="aspect-square bg-green-900 relative">
                <img src={p.image || "/assets/saree.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = "https://placehold.co/400x400/145C3E/D4AF37?text=Img" }} />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Star size={10} className="text-gold-500 fill-gold-500" />
                  <span className="text-white text-[10px] font-medium">{p.rating}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate mb-1">{p.name}</p>
                <p className="text-gold-500 font-semibold text-sm">â‚¹{p.price.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-green-500 text-sm">
            <Package size={24} className="mx-auto mb-2 opacity-50" />
            No products found in this category.
          </div>
        )}
      </div>

      {filteredProducts.length > BLOCK_PAGE_SIZE && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-green-800 pt-4">
          <p className="text-green-500 text-xs">
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
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Products</h1>
          <p className="text-green-400 text-sm mt-0.5">Manage your product catalog</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
        {["products", "categories"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
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
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full bg-green-900 border border-green-700 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-green-900 border border-green-700 text-green-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
            >
              {["All", "Active", "Low Stock", "Out of Stock", "Inactive"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="bg-green-900 border border-green-700 text-green-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
            >
              {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Button onClick={() => router.push("/admin/products/add")} className="ml-auto">
              <Plus size={14} /> Add Product
            </Button>
          </div>

          {/* Products Table */}
          <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-800">
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">Product</th>
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">Price</th>
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">Stock</th>
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-green-500">
                        <Package size={32} className="mx-auto mb-2 opacity-40" />
                        No products found
                      </td>
                    </tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id} onClick={() => router.push(`/admin/products/add?id=${p.id}`)} className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image || "/assets/saree.png"} alt={p.name} className="w-16 h-16 sm:w-9 sm:h-9 rounded-lg object-cover shrink-0" onError={(e) => { e.target.src = p.image; }} />
                          <div className="min-w-0">
                            <p className="text-white text-xs sm:text-sm font-medium truncate">{p.name}</p>
                            <p className="text-green-500 text-[10px] sm:text-xs truncate">{p.id}</p>
                            <p className="text-green-300 text-[10px] sm:hidden truncate mt-0.5">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-green-300 text-xs hidden sm:table-cell">{p.category}</td>
                      <td className="px-5 py-3 text-white text-xs font-semibold">â‚¹{p.price.toLocaleString()}</td>
                      <td className="px-5 py-3 text-green-300 text-xs">{p.stock}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-gold-500 fill-gold-500" />
                          <span className="text-green-300 text-xs">{p.rating} ({p.reviews})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-green-800 flex items-center justify-between">
              <p className="text-green-500 text-xs">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
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

      {/* â”€â”€ Modals â”€â”€ */}

      {/* Add/Edit Product */}
      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "add" ? "Add Product" : "Edit Product"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Product Name" id="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" required />
          <FormInput label="Category" id="category" type="select" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories.map((c) => c.name)} />
          <FormInput label="Subcategory" id="subcategory" value={form.subcategory || ""} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="e.g. Silk, Bridal" />
          <FormInput label="Price (â‚¹)" id="price" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" required />
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
        <p className="text-green-300 text-sm mb-2">Are you sure you want to delete</p>
        <p className="text-white font-semibold mb-5">{selected?.name}?</p>
        <p className="text-green-500 text-xs mb-5">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={deleteProduct}>Delete</Button>
        </div>
      </Modal>

      {/* Reviews Modal */}
      <Modal open={modal === "reviews"} onClose={() => setModal(null)} title={`Reviews â€” ${selected?.name}`} size="lg">
        <div className="space-y-3">
          {selected?.reviews > 0 ? (
            <p className="text-green-400 text-sm">
              {selected.reviews} reviews Â· Avg {selected.rating}â˜…
            </p>
          ) : (
            <p className="text-green-500 text-sm">
              No reviews yet for this product.
            </p>
          )}
          <div className="flex items-center gap-2 py-4">
            {[1,2,3,4,5].map((s) => <Star key={s} size={20} className={s <= Math.round(selected?.rating || 0) ? "text-gold-500 fill-gold-500" : "text-green-700"} />)}
            <span className="text-white font-semibold ml-1">{selected?.rating}</span>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Category */}
      <Modal open={modal === "addCat" || modal === "editCat"} onClose={() => setModal(null)} title={modal === "addCat" ? "Add Category" : "Edit Category"} size="md">
        <div className="space-y-4">
          <FormInput label="Category Name" id="catname" value={catForm.name || ""} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Sarees" required />
          <FormInput label="Slug" id="catslug" value={catForm.slug || ""} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="Generated from name if blank" />
          <FormInput label="Subtitle" id="catsubtitle" value={catForm.subtitle || ""} onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })} placeholder="e.g. SILKS" />
          <FormInput label="Description" id="catdesc" type="textarea" value={catForm.description || ""} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3} placeholder="Category description..." />
          <div>
            <label className="text-green-300 text-xs font-medium">Category Image</label>
            <div className="mt-2 flex items-center gap-3">
              {catForm.image && (
                <img src={catForm.image} alt={catForm.name || "Category"} className="h-20 w-20 rounded-lg object-cover border border-green-700" />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-green-700 bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700">
                <Upload size={14} />
                {catUploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCategoryImage} className="hidden" disabled={catUploading} />
              </label>
            </div>
          </div>
          <Toggle checked={!!catForm.isActive} onChange={(value) => setCatForm({ ...catForm, isActive: value })} label="Active" />
          {catError && <p className="text-sm text-red-400">{catError}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveCat}>{modal === "addCat" ? "Add Category" : "Save Changes"}</Button>
        </div>
      </Modal>

      {/* Delete Category */}
      <Modal open={modal === "deleteCat"} onClose={() => setModal(null)} title="Delete Category" size="sm">
        <p className="text-green-300 text-sm mb-2">Delete category <span className="text-white font-semibold">{selected?.name}</span>?</p>
        <p className="text-green-500 text-xs">Categories with assigned products cannot be deleted.</p>
        {catError && <p className="mt-3 text-sm text-red-400">{catError}</p>}
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={deleteCat}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

