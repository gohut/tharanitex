"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import Button from "../../../../components/ui/Button";
import FormInput from "../../../../components/ui/FormInput";
import Toggle from "../../../../components/ui/Toggle";
import { categories as initialCategories, products as initialProducts } from "../../../../data/products";

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [categories] = useState(initialCategories);

  // Main Product State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [status, setStatus] = useState("Active");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("0");

  const [actualPrice, setActualPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [images, setImages] = useState([]);

  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

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
    if (editId) {
      const product = initialProducts.find((p) => p.id === editId);
      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setCategory(product.category || (categories[0]?.name || ""));
        setStatus(product.status || "Active");
        setStock(product.stock !== undefined ? String(product.stock) : "");
        setRating(product.rating !== undefined ? String(product.rating) : "0");
        
        setSellingPrice(product.price ? String(product.price) : "");
        setActualPrice(product.price ? String(product.price) : "");
        
        if (product.image) {
          setImages([product.image]);
        }
        
        if (product.variants && product.variants.length > 0) {
          setHasVariants(true);
          setVariants(product.variants.map((v, i) => ({
            id: i,
            name: v.color || v.size || `Variant ${i+1}`,
            actualPrice: product.price ? String(product.price) : "",
            sellingPrice: product.price ? String(product.price) : "",
            stock: "",
            images: [],
          })));
        }
      }
    }
  }, [editId, categories]);

  const handleAddImage = () => {
    // Simulating adding an image
    setImages([...images, `https://placehold.co/150x150/145C3E/D4AF37?text=Img+${images.length + 1}`]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), name: "", actualPrice: "", sellingPrice: "", stock: "", images: [] },
    ]);
  };

  const handleRemoveVariant = (id) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleVariantAddImage = (id) => {
    setVariants(
      variants.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            images: [...v.images, `https://placehold.co/150x150/1A4B35/D4AF37?text=Var+Img+${v.images.length + 1}`],
          };
        }
        return v;
      })
    );
  };

  const handleVariantRemoveImage = (variantId, imageIndex) => {
    setVariants(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            images: v.images.filter((_, i) => i !== imageIndex),
          };
        }
        return v;
      })
    );
  };

  const handleSave = () => {
    // Here we'd normally dispatch to a global store or make an API call.
    // For now, simulate saving and return to list.
    console.log("Saving product:", {
      name, description, category, status, stock, rating, actualPrice, sellingPrice, images, hasVariants, variants
    });
    router.push("/admin/products");
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
                onChange={(e) => setRating(e.target.value)}
                placeholder="0.0"
              />
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

          {/* Variants Section */}
          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-green-800 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-white">Product Variants</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-300">Enable Variants</span>
                <Toggle checked={hasVariants} onChange={() => setHasVariants(!hasVariants)} />
              </div>
            </div>
            
            {hasVariants && (
              <div className="space-y-6">
                {variants.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-green-800 rounded-xl">
                    <p className="text-green-500 text-sm mb-3">No variants added yet</p>
                    <Button variant="secondary" onClick={handleAddVariant}>
                      <Plus size={14} className="mr-1" /> Add First Variant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="bg-green-950/50 border border-green-800 rounded-xl p-4 space-y-4 relative">
                        <div className="absolute right-4 top-4">
                          <button
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="p-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h3 className="text-gold-500 font-medium text-sm">Variant {index + 1}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="Variant Name"
                            id={`var-name-${variant.id}`}
                            value={variant.name}
                            onChange={(e) => handleVariantChange(variant.id, "name", e.target.value)}
                            placeholder="e.g. Red / Size M"
                          />
                          <FormInput
                            label="Availability (Stock)"
                            id={`var-stock-${variant.id}`}
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(variant.id, "stock", e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="Actual Price (₹)"
                            id={`var-actual-${variant.id}`}
                            type="number"
                            value={variant.actualPrice}
                            onChange={(e) => handleVariantChange(variant.id, "actualPrice", e.target.value)}
                            placeholder="0"
                          />
                          <FormInput
                            label="Selling Price (₹)"
                            id={`var-sell-${variant.id}`}
                            type="number"
                            value={variant.sellingPrice}
                            onChange={(e) => handleVariantChange(variant.id, "sellingPrice", e.target.value)}
                            placeholder="0"
                          />
                        </div>

                        {/* Variant Images */}
                        <div>
                          <label className="block text-sm font-medium text-green-300 mb-1.5">Variant Images</label>
                          <div className="flex flex-wrap gap-3">
                            {variant.images.map((img, i) => (
                              <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-green-700">
                                <img src={img} alt={`Variant image ${i}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleVariantRemoveImage(variant.id, i)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => handleVariantAddImage(variant.id)}
                              className="w-16 h-16 rounded-lg border-2 border-dashed border-green-700 hover:border-gold-500 hover:bg-green-800/50 flex flex-col items-center justify-center text-green-500 hover:text-gold-500 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddVariant} className="w-full justify-center border-dashed border-2">
                      <Plus size={14} className="mr-1" /> Add Another Variant
                    </Button>
                  </div>
                )}
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
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddImage}
                className="aspect-square rounded-xl border-2 border-dashed border-green-700 hover:border-gold-500 hover:bg-green-800/50 flex flex-col items-center justify-center text-green-500 hover:text-gold-500 transition-colors"
              >
                <Upload size={24} className="mb-2" />
                <span className="text-xs font-medium">Upload Image</span>
              </button>
            </div>
            {images.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-green-950/50 border border-green-800 rounded-xl text-green-400 text-xs">
                <ImageIcon size={16} className="shrink-0 mt-0.5" />
                <p>Upload at least one image for your product to make it stand out.</p>
              </div>
            )}
          </div>

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card">
            <Button onClick={handleSave} className="w-full justify-center text-base py-3">
              {isEditing ? "Save Changes" : "Save Product"}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/admin/products")} className="w-full justify-center text-base py-3 mt-3">
              Cancel
            </Button>
            {isEditing && (
              <Button variant="danger" onClick={() => router.push("/admin/products")} className="w-full justify-center text-base py-3 mt-4">
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
