"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  ImageIcon,
  X,
  Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";

function AddProductContent() {
  const router = useRouter();
  const [deleteResult, setDeleteResult] = useState(null);
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Pricing
  const [actualPrice, setActualPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  // Product images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [slug, setSlug] = useState("");

  // UI States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    completed: 0,
    total: 0,
  });

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
        if (!res.ok) throw new Error("Failed to load categories");
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
        if (!res.ok) throw new Error("Failed to load product");
        const product = await res.json();

        setVariants(
          Array.isArray(product.variants)
            ? product.variants.map((variant) => {
                let variantImages = [];
                if (Array.isArray(variant.images) && variant.images.length > 0) {
                  variantImages = variant.images.map((img, idx) => ({
                    id: img.id || undefined,
                    file: null,
                    preview: img.imageUrl || img.image_url || (typeof img === "string" ? img : ""),
                    url: img.imageUrl || img.image_url || (typeof img === "string" ? img : ""),
                    isPrimary: Boolean(img.isPrimary ?? (idx === 0)),
                    sortOrder: img.sortOrder ?? idx,
                  }));
                } else if (variant.image_url || variant.imageUrl) {
                  const singleUrl = variant.image_url || variant.imageUrl;
                  variantImages = [
                    {
                      id: undefined,
                      file: null,
                      preview: singleUrl,
                      url: singleUrl,
                      isPrimary: true,
                      sortOrder: 0,
                    },
                  ];
                }

                return {
                  id: variant.id,
                  name: variant.name || "",
                  sku: variant.sku || "",
                  price: variant.price ?? "",
                  stock: variant.stock ?? 0,
                  images: variantImages,
                  isActive:
                    variant.is_active !== undefined
                      ? Boolean(variant.is_active)
                      : variant.isActive !== undefined
                      ? Boolean(variant.isActive)
                      : true,
                };
              })
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

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const previews = validFiles.map((file) => URL.createObjectURL(file));

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
    setImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleVariantImagesChange = (event, variantIndex) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, WEBP, etc.).");
      return;
    }

    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) return variant;
        const currentImages = Array.isArray(variant.images) ? variant.images : [];
        const startIndex = currentImages.length;
        const newImages = validFiles.map((file, i) => {
          const preview = URL.createObjectURL(file);
          return {
            file,
            preview,
            url: "",
            isPrimary: startIndex === 0 && i === 0,
            sortOrder: startIndex + i,
          };
        });

        const merged = [...currentImages, ...newImages];
        const hasPrimary = merged.some((img) => img.isPrimary);
        if (!hasPrimary && merged.length > 0) {
          merged[0].isPrimary = true;
        }

        return {
          ...variant,
          images: merged,
        };
      })
    );

    event.target.value = "";
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setVariants((prev) =>
      prev.map((variant, vIdx) => {
        if (vIdx !== variantIndex) return variant;
        const currentImages = Array.isArray(variant.images) ? variant.images : [];
        const imageToRemove = currentImages[imageIndex];

        if (imageToRemove?.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(imageToRemove.preview);
        }

        const filtered = currentImages.filter((_, i) => i !== imageIndex);
        const wasPrimary = imageToRemove?.isPrimary;
        const reindexed = filtered.map((img, idx) => ({
          ...img,
          sortOrder: idx,
          isPrimary: wasPrimary && idx === 0 ? true : img.isPrimary,
        }));

        if (reindexed.length > 0 && !reindexed.some((img) => img.isPrimary)) {
          reindexed[0].isPrimary = true;
        }

        return {
          ...variant,
          images: reindexed,
        };
      })
    );
  };

  const moveVariantImage = (variantIndex, imageIndex, direction) => {
    setVariants((prev) =>
      prev.map((variant, vIdx) => {
        if (vIdx !== variantIndex) return variant;
        const currentImages = Array.isArray(variant.images) ? [...variant.images] : [];
        const targetIndex = imageIndex + direction;
        if (targetIndex < 0 || targetIndex >= currentImages.length) return variant;

        const [moved] = currentImages.splice(imageIndex, 1);
        currentImages.splice(targetIndex, 0, moved);

        const reindexed = currentImages.map((img, idx) => ({
          ...img,
          sortOrder: idx,
        }));

        return {
          ...variant,
          images: reindexed,
        };
      })
    );
  };

  const makeVariantImagePrimary = (variantIndex, imageIndex) => {
    setVariants((prev) =>
      prev.map((variant, vIdx) => {
        if (vIdx !== variantIndex) return variant;
        const currentImages = Array.isArray(variant.images) ? [...variant.images] : [];
        if (imageIndex < 0 || imageIndex >= currentImages.length) return variant;

        const updated = currentImages.map((img) => ({
          ...img,
          isPrimary: false,
        }));

        const [primaryItem] = updated.splice(imageIndex, 1);
        primaryItem.isPrimary = true;
        updated.unshift(primaryItem);

        const reindexed = updated.map((img, idx) => ({
          ...img,
          sortOrder: idx,
        }));

        return {
          ...variant,
          images: reindexed,
        };
      })
    );
  };

  const removeVariant = (index) => {
    setVariants((prev) => {
      const variantToRemove = prev[index];
      if (variantToRemove && Array.isArray(variantToRemove.images)) {
        variantToRemove.images.forEach((img) => {
          if (img.preview?.startsWith("blob:")) {
            URL.revokeObjectURL(img.preview);
          }
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDelete = async () => {
    if (!editId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/products/${editId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      setShowDeleteModal(false);

      if (data.archived) {
        setDeleteResult({
          type: "archived",
          title: "Product Archived",
          message:
            "This product has existing orders, so it cannot be permanently deleted. The product has been archived and marked inactive.",
        });
      } else {
        setDeleteResult({
          type: "deleted",
          title: "Product Deleted",
          message: "The product has been permanently deleted successfully.",
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadFile = async (file, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Image upload failed");
    }
    if (!data.url) {
      throw new Error("Image upload did not return a URL");
    }
    return data.url;
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

      const selectedCategory = categories.find((c) => c.name === category);
      if (!selectedCategory) {
        alert("Please select a category.");
        return;
      }

      const newProductImages = imageFiles.length;
      let newVariantImages = 0;
      for (const variant of variants) {
        if (Array.isArray(variant.images)) {
          for (const img of variant.images) {
            if (img.file) {
              newVariantImages++;
            }
          }
        }
      }
      const totalUploads = newProductImages + newVariantImages;

      setIsUploading(true);
      setUploadProgress({ completed: 0, total: totalUploads });

      const uploadedProductImages = new Map();
      for (const item of imageFiles) {
        const url = await uploadFile(item.file, "products");
        uploadedProductImages.set(item.preview, url);
        setUploadProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      }

      const finalImages = images
        .map((img, index) => {
          const finalUrl = img.startsWith("blob:")
            ? uploadedProductImages.get(img)
            : img;
          if (!finalUrl) return null;
          return {
            imageUrl: finalUrl,
            sortOrder: index,
            isPrimary: index === 0,
          };
        })
        .filter(Boolean);

      const finalVariants = [];
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const rawImages = Array.isArray(variant.images) ? variant.images : [];
        const variantFinalImages = [];

        for (let j = 0; j < rawImages.length; j++) {
          const imgItem = rawImages[j];
          let finalUrl = imgItem.url || imgItem.preview;

          if (imgItem.file) {
            finalUrl = await uploadFile(imgItem.file, "variants");
            setUploadProgress((prev) => ({
              ...prev,
              completed: prev.completed + 1,
            }));
          }

          if (finalUrl && !finalUrl.startsWith("blob:")) {
            variantFinalImages.push({
              id: imgItem.id,
              imageUrl: finalUrl,
              sortOrder: j,
              isPrimary: Boolean(imgItem.isPrimary ?? (j === 0)),
            });
          }
        }

        const primaryImg =
          variantFinalImages.find((img) => img.isPrimary) || variantFinalImages[0];

        finalVariants.push({
          id: variant.id,
          name: variant.name.trim() || `Variant ${i + 1}`,
          sku: variant.sku ? variant.sku.trim() : null,
          price: Number(variant.price) || Number(sellingPrice),
          stock: Number(variant.stock) || 0,
          imageUrl: primaryImg?.imageUrl || null,
          images: variantFinalImages,
          isActive: Boolean(variant.isActive),
        });
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
        price: Number(sellingPrice),
        stock: Number(stock || 0),
        categoryId: selectedCategory.id,
        featured,
        isNewArrival,
        isBestSeller,
        isActive: status !== "Out of Stock",
        images: finalImages,
        variants: finalVariants,
      };

      const endpoint = isEditing
        ? `/api/admin/products/${editId}`
        : "/api/admin/products";

      const res = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Save product error:", error);
      alert(error.message || "Failed to save product");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="p-2.5 rounded-xl bg-white border border-[#E8DCC8] hover:bg-[#FAF6F0] text-[#2F2B27] transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-[#2F2B27]">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-[#7C7267] mt-0.5">
            {isEditing
              ? "Modify product details, pricing, variants and images"
              : "Create a new catalog product with details, prices, variants and media"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFORMATION */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
              Basic Information
            </h2>

            <FormInput
              label="Product Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pure Kanchipuram Silk Saree"
              required
            />

            <FormInput
              label="Description"
              id="desc"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed fabric, weave, motif and wash-care details..."
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
                  const val = e.target.value;
                  if (val === "" || (Number(val) >= 0 && Number(val) <= 5)) {
                    setRating(val);
                  }
                }}
                min="0"
                max="5"
                step="0.1"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* HOMEPAGE PLACEMENT */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
              Storefront Badges & Showcase
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Toggle
                checked={featured}
                onChange={setFeatured}
                label="Featured"
              />
              <Toggle
                checked={isNewArrival}
                onChange={setIsNewArrival}
                label="New Arrival"
              />
              <Toggle
                checked={isBestSeller}
                onChange={setIsBestSeller}
                label="Best Seller"
              />
            </div>
          </div>

          {/* PRICING & INVENTORY */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Original MRP / Actual Price (₹)"
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
                  <div className="absolute right-0 top-0 bg-[#FAF3E0] text-[#8C6D1F] border border-[#E8DCC8] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Available Stock"
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
              />

              <FormInput
                label="Stock Status"
                id="status"
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={["Active", "Low Stock", "Out of Stock"]}
              />
            </div>
          </div>

          {/* PRODUCT VARIANTS */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#2F2B27]">
                  Product Variants
                </h2>
                <p className="mt-0.5 text-xs text-[#7C7267]">
                  Add distinct color, pattern or size variants with custom price, stock and image.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={isUploading}
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    {
                      id: undefined,
                      name: "",
                      sku: "",
                      price: sellingPrice || "",
                      stock: 0,
                      images: [],
                      isActive: true,
                    },
                  ])
                }
              >
                <Plus size={14} /> Add Variant
              </Button>
            </div>

            {variants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E8DCC8] bg-[#FAF6F0] p-6 text-center">
                <p className="text-sm font-semibold text-[#2F2B27]">
                  No custom variants added.
                </p>
                <p className="mt-1 text-xs text-[#7C7267]">
                  This product will use its default price, stock, and primary images.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id || `new-${index}`}
                    className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0]/60 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F]">
                        Variant {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormInput
                        label="Variant Name"
                        id={`variant-name-${index}`}
                        value={variant.name}
                        placeholder="e.g. Royal Blue / Maroon"
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, name: e.target.value } : item
                            )
                          )
                        }
                      />

                      <FormInput
                        label="SKU"
                        id={`variant-sku-${index}`}
                        value={variant.sku}
                        placeholder="e.g. TT-SILK-BLU-01"
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, sku: e.target.value } : item
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
                              i === index ? { ...item, price: e.target.value } : item
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
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, stock: val === "" ? "" : Number(val) }
                                : item
                            )
                          );
                        }}
                      />
                    </div>

                    {/* Variant Photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#2F2B27]">
                          Variant Photos ({variant.images?.length || 0})
                        </label>
                        <span className="text-[11px] text-[#7C7267]">
                          Multiple photos supported
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {(variant.images || []).map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-[#E8DCC8] bg-white shadow-sm"
                          >
                            <img
                              src={img.preview || img.url}
                              alt={`Variant ${index + 1} Photo ${imgIdx + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {img.isPrimary && (
                              <span className="absolute left-1.5 top-1.5 rounded-md bg-[#D4AF37] px-1.5 py-0.5 text-[9px] font-bold text-[#2F2B27] shadow-sm">
                                Primary
                              </span>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                              {!img.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => makeVariantImagePrimary(index, imgIdx)}
                                  className="rounded bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold text-[#2F2B27] hover:bg-[#c49f2e]"
                                >
                                  Make Primary
                                </button>
                              )}

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveVariantImage(index, imgIdx, -1)}
                                  disabled={imgIdx === 0}
                                  title="Move left"
                                  className="rounded bg-white p-1 text-[#2F2B27] hover:bg-[#FAF6F0] disabled:opacity-30"
                                >
                                  <ArrowLeft size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveVariantImage(index, imgIdx, 1)}
                                  disabled={imgIdx === (variant.images?.length || 1) - 1}
                                  title="Move right"
                                  className="rounded bg-white p-1 text-[#2F2B27] hover:bg-[#FAF6F0] disabled:opacity-30"
                                >
                                  <ArrowRight size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(index, imgIdx)}
                                  title="Remove photo"
                                  className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8DCC8] bg-white p-2 text-center text-[#7C7267] transition hover:border-[#D4AF37] hover:bg-[#FAF3E0] hover:text-[#8C6D1F]">
                          <Upload size={18} className="mb-0.5 text-[#8C6D1F]" />
                          <span className="text-[11px] font-bold">Add Photos</span>
                          <span className="text-[9px] text-[#A89F91]">PNG, JPG, WEBP</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleVariantImagesChange(e, index)}
                          />
                        </label>
                      </div>
                    </div>

                    <Toggle
                      checked={variant.isActive}
                      onChange={(value) =>
                        setVariants((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, isActive: value } : item
                          )
                        )
                      }
                      label="Active"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* PRODUCT MEDIA */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2F2B27] border-b border-[#E8DCC8] pb-3">
              Product Images
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-[#E8DCC8] bg-[#FAF6F0]"
                >
                  <img
                    src={img}
                    alt={`Product ${idx}`}
                    className="w-full h-full object-cover"
                  />

                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold text-[#2F2B27] shadow-sm">
                      Primary
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makePrimary(idx)}
                        className="rounded-lg bg-[#D4AF37] px-2.5 py-1 text-xs font-bold text-[#2F2B27]"
                      >
                        Make Primary
                      </button>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 bg-white text-[#2F2B27] rounded-lg disabled:opacity-40"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 1)}
                        disabled={idx === images.length - 1}
                        className="p-1.5 bg-white text-[#2F2B27] rounded-lg disabled:opacity-40"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <label className="aspect-square rounded-xl border-2 border-dashed border-[#E8DCC8] bg-[#FAF6F0] hover:border-[#D4AF37] hover:bg-[#FAF3E0] flex flex-col items-center justify-center text-[#7C7267] hover:text-[#8C6D1F] transition-colors cursor-pointer p-4 text-center">
                <Upload size={24} className="mb-1 text-[#8C6D1F]" />
                <span className="text-xs font-bold">Add Image</span>
                <span className="text-[10px] text-[#A89F91] mt-0.5">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-[#FAF6F0] border border-[#E8DCC8] rounded-xl text-[#7C7267] text-xs">
                <ImageIcon size={16} className="shrink-0 mt-0.5 text-[#8C6D1F]" />
                <p>Upload at least one primary image for this product.</p>
              </div>
            )}
          </div>

          {/* SAVE / ACTIONS */}
          <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-sm space-y-3">
            {isUploading && (
              <div className="mb-4 rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] p-3 text-xs text-[#2F2B27]">
                Uploading images {uploadProgress.completed}/{uploadProgress.total}...
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8DCC8]">
                  <div
                    className="h-full rounded-full bg-[#D4AF37] transition-all"
                    style={{
                      width: `${
                        uploadProgress.total
                          ? (uploadProgress.completed / uploadProgress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isUploading}
              className="w-full justify-center text-sm font-bold py-3"
            >
              {isUploading
                ? `Uploading ${uploadProgress.completed}/${uploadProgress.total}...`
                : isEditing
                ? "Save Changes"
                : "Publish Product"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/admin/products")}
              className="w-full justify-center text-sm py-3"
            >
              Cancel
            </Button>

            {isEditing && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="w-full justify-center text-sm py-3"
              >
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="text-lg font-bold text-[#2F2B27]">Delete Product?</h2>
            <p className="text-sm leading-6 text-[#7C7267]">
              Are you sure you want to delete <span className="font-bold text-[#2F2B27]">{name}</span>?
              If this product has active orders, it will be safely archived instead of hard-deleted.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] px-4 py-2.5 text-xs font-bold text-[#2F2B27] hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteResult && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] rounded-2xl border border-[#E8DCC8] bg-white p-7 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF3E0] text-[#8C6D1F]">
              <span className="text-xl font-bold">
                {deleteResult.type === "archived" ? "!" : "✓"}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#2F2B27]">
              {deleteResult.title}
            </h2>
            <p className="text-sm leading-6 text-[#7C7267]">
              {deleteResult.message}
            </p>

            <Button
              onClick={() => {
                setDeleteResult(null);
                router.push("/admin/products");
                router.refresh();
              }}
              className="w-full justify-center"
            >
              Back to Catalog
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[#7C7267]">Loading product form...</div>}>
      <AddProductContent />
    </Suspense>
  );
}