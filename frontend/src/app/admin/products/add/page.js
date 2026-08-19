"use client";
import { Suspense } from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, Upload, ImageIcon } from "lucide-react";
import Button from "../../../../components/ui/Button";
import FormInput from "../../../../components/ui/FormInput";
import Toggle from "../../../../components/ui/Toggle";

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;
  const [variants, setVariants] = useState([]);

  const [categories, setCategories] = useState([]);

  // Main Product State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [actualPrice, setActualPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [slug, setSlug] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });

  // Calculated Discount for Main Product
  const discount = useMemo(() => {
    if (actualPrice && sellingPrice && Number(actualPrice) > 0) {
      const actual = Number(actualPrice);
      const selling = Number(sellingPrice);
      if (actual > selling) {
        return Math.round(((actual - selling) / actual) * 100);
      }
    }
    return 0;
  }, [actualPrice, sellingPrice]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await res.json();

        setCategories(data);

        if (data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (error) {
        console.error("Category load error:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!editId) return;

    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${editId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load product");
        }

        const product = await res.json();

        setVariants(
          Array.isArray(product.variants)
            ? product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name || "",
                sku: variant.sku || "",
                price: variant.price ?? "",
                stock: variant.stock ?? 0,
                imageUrl:
                  variant.image_url ||
                  variant.imageUrl ||
                  "",
                isActive:
                  variant.is_active !== undefined
                    ? Boolean(variant.is_active)
                    : variant.isActive !== undefined
                    ? Boolean(variant.isActive)
                    : true,
              }))
            : []
        );

        setName(product.name || "");
        setSlug(product.slug || "");
        setDescription(product.description || "");
        setCategory(product.category || "");
        setSellingPrice(String(product.price ?? ""));
        setActualPrice(String(product.price ?? ""));
        setStock(String(product.stock ?? ""));
        setStatus(product.isActive ? "Active" : "Out of Stock");
        setFeatured(!!product.featured);
        setIsNewArrival(!!product.isNewArrival);
        setIsBestSeller(!!product.isBestSeller);

        // PUT IT HERE ↓
        const existingUrls = Array.isArray(product.images)
          ? product.images.map((img) => img.imageUrl)
          : [];

        setExistingImages(existingUrls);
        setImages(existingUrls);
        setImageFiles([]);

      } catch (error) {
        console.error("Product load error:", error);
        alert("Failed to load product.");
      }
    }

    loadProduct();
  }, [editId]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const previews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles((prev) => [
      ...prev,
      ...validFiles.map((file, index) => ({
        file,
        preview: previews[index],
      })),
    ]);
    setImages((prev) => [...prev, ...previews]);

    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];

    if (imageToRemove?.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove);

      setImageFiles((prev) =>
        prev.filter((item) => item.preview !== imageToRemove)
      );
    } else {
      setExistingImages((prev) =>
        prev.filter((url) => url !== imageToRemove)
      );
    }

    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const moveImage = (index, direction) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const makePrimary = (index) => {
    if (index === 0) return;

    setImages((prev) => {
      const next = [...prev];
      const [selectedImage] = next.splice(index, 1);
      next.unshift(selectedImage);
      return next;
    });
  };

  const handleDelete = async () => {
  if (!editId) return;

  try {
    setIsDeleting(true);

    const res = await fetch(
      `/api/admin/products/${editId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || "Failed to delete product"
      );
    }

    setShowDeleteModal(false);

    router.push("/admin/products");
    router.refresh();
  } catch (error) {
    console.error("Delete product error:", error);

    alert(
      error.message || "Failed to delete product"
    );
  } finally {
    setIsDeleting(false);
  }
};



const handleSave = async () => {
    try {
      if (!name.trim()) {
        alert("Product name is required.");
        return;
      }

      if (!sellingPrice || Number(sellingPrice) <= 0) {
        alert("Valid selling price is required.");
        return;
      }

      const selectedCategory = categories.find(
        (c) => c.name === category
      );

      if (!selectedCategory) {
        alert("Please select a category.");
        return;
      }

      // -----------------------------
      // Upload images to R2
      // Keep parallel uploads, but limit concurrency to 3 and retry failures.
      // There is intentionally NO image-count or file-size limit here.
      // -----------------------------
      setIsUploading(true);
      setUploadProgress({ completed: 0, total: imageFiles.length });

      const uploadOne = async (item, maxAttempts = 3) => {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            const formData = new FormData();
            formData.append("file", item.file);
            formData.append("folder", "products");

            const uploadRes = await fetch("/api/admin/upload", {
              method: "POST",
              body: formData,
            });

            const uploadData = await uploadRes.json().catch(() => ({}));

            if (!uploadRes.ok) {
              throw new Error(uploadData.error || "Image upload failed");
            }

            return {
              preview: item.preview,
              url: uploadData.url,
            };
          } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            }
          }
        }

        throw lastError || new Error("Image upload failed");
      };

      const uploadResults = [];
      let nextIndex = 0;

      const worker = async () => {
        while (true) {
          const index = nextIndex++;
          if (index >= imageFiles.length) return;

          const result = await uploadOne(imageFiles[index]);
          uploadResults[index] = result;
          setUploadProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        }
      };

      const workerCount = Math.min(3, imageFiles.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));
      setIsUploading(false);

      const uploadedByPreview = new Map(
        uploadResults.map((item) => [
          item.preview,
          item.url,
        ])
      );
      // -----------------------------
      // Create product
      // -----------------------------

const finalImages = images
  .map((image) => uploadedByPreview.get(image) || image)
  .filter((image) => !image.startsWith("blob:"));

  console.log(
  "VARIANTS BEFORE PAYLOAD:",
  JSON.stringify(variants, null, 2)
);
const payload = {
    name: name.trim(),
    slug: isEditing ? slug : undefined,
    description: description.trim(),
    price: Number(sellingPrice),
    stock: Number(stock || 0),
    categoryId: selectedCategory.id,
    featured,
    isNewArrival,
    isBestSeller,
    isActive: status !== "Out of Stock",
    images: finalImages,
    variants: variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: Number(variant.price) || 0,
    stock: Number(variant.stock) || 0,
    imageUrl: variant.imageUrl || null,
    isActive: variant.isActive !== false,
  })),
  };

  const endpoint = isEditing
    ? `/api/admin/products/${editId}`
    : "/api/admin/products";

  const res = await fetch(endpoint, {
    method: isEditing ? "PATCH" : "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create product"
        );
      }

      router.push("/admin/products");
      router.refresh();

    } catch (error) {
      setIsUploading(false);
      console.error("Save product error:", error);

      alert(
        error.message ||
        "Failed to save product"
      );
    }
  };
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="p-2 rounded-xl bg-green-900 hover:bg-green-800 text-green-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white text-2xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-green-400 text-sm mt-0.5">{isEditing ? "Modify product details and pricing" : "Create a new product with details, prices, and variants"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">Basic Information</h2>
            <FormInput
              label="Product Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Silk Saree"
              required
            />
            <FormInput
              label="Description"
              id="desc"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the product..."
              rows={4}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Category"
                id="category"
                type="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categories.map((c) => c.name)}
              />
              <FormInput
                label="Rating"
                id="rating"
                type="number"
                value={rating}
                onChange={(e) => {
                  const value = e.target.value;

                  if (
                    value === "" ||
                    (Number(value) >= 0 && Number(value) <= 5)
                  ) {
                    setRating(value);
                  }
                }}
                min="0"
                max="5"
                step="0.1"
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">Homepage Placement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Toggle checked={featured} onChange={setFeatured} label="Featured" />
              <Toggle checked={isNewArrival} onChange={setIsNewArrival} label="New Arrival" />
              <Toggle checked={isBestSeller} onChange={setIsBestSeller} label="Best Seller" />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Actual Price (₹)"
                id="actualPrice"
                type="number"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                placeholder="0"
                required
              />
              <div className="relative">
                <FormInput
                  label="Selling Price (₹)"
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0"
                  required
                />
                {discount > 0 && (
                  <div className="absolute right-0 top-0 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Stock Quantity"
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
              />
              <FormInput
                label="Status"
                id="status"
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={["Active", "Low Stock", "Out of Stock"]}
              />
            </div>
          </div>
          {/* Product Variants */}
          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-green-800 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Product Variants
                </h2>

                <p className="mt-1 text-xs text-green-400">
                  Add different versions of this product with their own price and stock.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    {
                      id: undefined,
                      name: "",
                      sku: "",
                      price: sellingPrice || "",
                      stock: 0,
                      imageUrl: "",
                      isActive: true,
                    },
                  ])
                }
                className="rounded-lg bg-gold-600 px-3 py-2 text-xs font-semibold text-green-950 hover:bg-gold-500"
              >
                + Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-green-700 bg-green-950/40 p-5 text-center">
                <p className="text-sm text-green-400">
                  No variants added.
                </p>

                <p className="mt-1 text-xs text-green-500">
                  This product will use its default price and stock.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id || `new-${index}`}
                    className="rounded-xl border border-green-800 bg-green-950/50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Variant {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormInput
                        label="Variant Name"
                        id={`variant-name-${index}`}
                        value={variant.name}
                        placeholder="e.g. Green"
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          )
                        }
                      />

                      <FormInput
                        label="SKU"
                        id={`variant-sku-${index}`}
                        value={variant.sku}
                        placeholder="e.g. SAREE-GRN-001"
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, sku: e.target.value }
                                : item
                            )
                          )
                        }
                      />

                      <FormInput
                        label="Price (₹)"
                        id={`variant-price-${index}`}
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, price: e.target.value }
                                : item
                            )
                          )
                        }
                      />

                      <FormInput
                        label="Stock"
                        id={`variant-stock-${index}`}
                        type="number"
                        value={variant.stock ?? ""}
                        placeholder="0"
                        onChange={(e) => {
                          const value = e.target.value;

                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    stock: value === "" ? "" : Number(value),
                                  }
                                : item
                            )
                          );
                        }}
                      />

                      <FormInput
                        label="Image URL"
                        id={`variant-image-${index}`}
                        value={variant.imageUrl}
                        placeholder="/api/images/..."
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, imageUrl: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <Toggle
                        checked={variant.isActive}
                        onChange={(value) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, isActive: value }
                                : item
                            )
                          )
                        }
                        label="Active"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Images & Actions */}
        <div className="space-y-6">
          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">Product Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-green-700 bg-green-950">
                  <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded bg-gold-600 px-2 py-0.5 text-[10px] font-semibold text-green-950">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx !== 0 && (
                      <button
                        onClick={() => makePrimary(idx)}
                        className="rounded-lg bg-gold-600 px-2 py-1 text-xs font-semibold text-green-950 hover:bg-gold-500 transition-colors"
                      >
                        Make Primary
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveImage(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors shadow-lg"
                        aria-label="Move image up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveImage(idx, 1)}
                        disabled={idx === images.length - 1}
                        className="p-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors shadow-lg"
                        aria-label="Move image down"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
                <label
                className="
                  aspect-square rounded-xl
                  border-2 border-dashed border-green-700
                  hover:border-gold-500
                  hover:bg-green-800/50
                  flex flex-col items-center justify-center
                  text-green-500 hover:text-gold-500
                  transition-colors cursor-pointer
                "
              >
                <Upload size={24} className="mb-2" />

                <span className="text-xs font-medium">
                  Upload Image
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {images.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-green-950/50 border border-green-800 rounded-xl text-green-400 text-xs">
                <ImageIcon size={16} className="shrink-0 mt-0.5" />
                <p>Upload at least one image for your product to make it stand out.</p>
              </div>
            )}
          </div>

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card">
            {isUploading && (
              <div className="mb-4 rounded-xl border border-green-800 bg-green-950/50 p-3 text-xs text-green-300">
                Uploading images {uploadProgress.completed}/{uploadProgress.total}...
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-green-800">
                  <div
                    className="h-full rounded-full bg-gold-500 transition-all"
                    style={{
                      width: `${uploadProgress.total ? (uploadProgress.completed / uploadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <Button onClick={handleSave} disabled={isUploading} className="w-full justify-center text-base py-3">
              {isUploading ? `Uploading ${uploadProgress.completed}/${uploadProgress.total}...` : (isEditing ? "Save Changes" : "Save Product")}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/admin/products")} className="w-full justify-center text-base py-3 mt-3">
              Cancel
            </Button>
            {isEditing && (
              <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="w-full justify-center text-base py-3 mt-4">
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">

    <div className="w-full max-w-md rounded-2xl border border-green-800 bg-green-950 p-6 shadow-2xl">

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <Trash2 size={22} />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-white">
        Delete Product?
      </h2>

      <p className="mt-3 text-sm leading-6 text-green-300">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-white">
          {name}
        </span>
        ? This action cannot be undone.
      </p>

      <div className="mt-7 flex justify-end gap-3">

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setShowDeleteModal(false)}
          className="
            rounded-lg
            border border-green-700
            px-5 py-2.5
            text-sm font-medium text-green-200
            transition
            hover:bg-green-900
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="
            rounded-lg
            bg-red-600
            px-5 py-2.5
            text-sm font-semibold text-white
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isDeleting ? "Deleting..." : "Delete Product"}
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <AddProductContent />
    </Suspense>
  );
}
