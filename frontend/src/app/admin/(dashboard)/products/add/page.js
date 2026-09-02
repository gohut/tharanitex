"use client";

import { Suspense } from "react";

import {
  useState,
  useMemo,
  useEffect,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Toggle from "@/components/ui/Toggle";

function AddProductContent() {
  const router = useRouter();
  const [deleteResult, setDeleteResult] = useState(null);
  const searchParams =
    useSearchParams();

  const editId =
    searchParams.get("id");

  const isEditing =
    !!editId;

  const [variants, setVariants] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  // Product
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("Active");

  const [stock, setStock] =
    useState("");

  const [rating, setRating] =
    useState("0");

  const [featured, setFeatured] =
    useState(false);

  const [isNewArrival, setIsNewArrival] =
    useState(false);

  const [isBestSeller, setIsBestSeller] =
    useState(false);

  // Pricing
  const [actualPrice, setActualPrice] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  // Product images
  const [images, setImages] =
    useState([]);

  const [imageFiles, setImageFiles] =
    useState([]);

  const [existingImages, setExistingImages] =
    useState([]);

  const [slug, setSlug] =
    useState("");

  // UI
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState({
      completed: 0,
      total: 0,
    });

  const discount = useMemo(() => {
    if (
      actualPrice &&
      sellingPrice &&
      Number(actualPrice) > 0
    ) {
      const actual =
        Number(actualPrice);

      const selling =
        Number(sellingPrice);

      if (actual > selling) {
        return Math.round(
          ((actual - selling) /
            actual) *
            100
        );
      }
    }

    return 0;
  }, [
    actualPrice,
    sellingPrice,
  ]);

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {
    async function loadCategories() {
      try {
        const res =
          await fetch(
            "/api/admin/categories",
            {
              cache: "no-store",
            }
          );

        if (!res.ok) {
          throw new Error(
            "Failed to load categories"
          );
        }

        const data =
          await res.json();

        setCategories(data);

        if (data.length > 0) {
          setCategory(
            data[0].name
          );
        }
      } catch (error) {
        console.error(
          "Category load error:",
          error
        );
      }
    }

    loadCategories();
  }, []);

  // ============================================================
  // LOAD PRODUCT WHEN EDITING
  // ============================================================

  useEffect(() => {
    if (!editId) return;

    async function loadProduct() {
      try {
        const res =
          await fetch(
            `/api/admin/products/${editId}`,
            {
              cache: "no-store",
            }
          );

        if (!res.ok) {
          throw new Error(
            "Failed to load product"
          );
        }

        const product =
          await res.json();

        setVariants(
          Array.isArray(
            product.variants
          )
            ? product.variants.map(
                (variant) => ({
                  id: variant.id,

                  name:
                    variant.name ||
                    "",

                  sku:
                    variant.sku ||
                    "",

                  price:
                    variant.price ??
                    "",

                  stock:
                    variant.stock ??
                    0,

                  imageUrl:
                    variant.image_url ||
                    variant.imageUrl ||
                    "",

                  imageFile:
                    null,

                  imagePreview:
                    variant.image_url ||
                    variant.imageUrl ||
                    "",

                  isActive:
                    variant.is_active !==
                    undefined
                      ? Boolean(
                          variant.is_active
                        )
                      : variant.isActive !==
                          undefined
                        ? Boolean(
                            variant.isActive
                          )
                        : true,
                })
              )
            : []
        );

        setName(
          product.name || ""
        );

        setSlug(
          product.slug || ""
        );

        setDescription(
          product.description ||
            ""
        );

        setCategory(
          product.category || ""
        );

        setSellingPrice(
          String(
            product.price ?? ""
          )
        );

        setActualPrice(
          String(
            product.price ?? ""
          )
        );

        setStock(
          String(
            product.stock ?? ""
          )
        );

        setStatus(
          product.isActive
            ? "Active"
            : "Out of Stock"
        );

        setFeatured(
          !!product.featured
        );

        setIsNewArrival(
          !!product.isNewArrival
        );

        setIsBestSeller(
          !!product.isBestSeller
        );

        const existingUrls =
          Array.isArray(
            product.images
          )
            ? product.images.map(
                (img) =>
                  img.imageUrl
              )
            : [];

        setExistingImages(
          existingUrls
        );

        setImages(
          existingUrls
        );

        setImageFiles([]);
      } catch (error) {
        console.error(
          "Product load error:",
          error
        );

        alert(
          "Failed to load product."
        );
      }
    }

    loadProduct();
  }, [editId]);

  // ============================================================
  // PRODUCT IMAGE UPLOAD
  // ============================================================

  const handleImageChange = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const validFiles =
      files.filter((file) =>
        file.type.startsWith(
          "image/"
        )
      );

    const previews =
      validFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );

    setImageFiles((prev) => [
      ...prev,

      ...validFiles.map(
        (file, index) => ({
          file,
          preview:
            previews[index],
        })
      ),
    ]);

    setImages((prev) => [
      ...prev,
      ...previews,
    ]);

    event.target.value = "";
  };

  const handleRemoveImage = (
    index
  ) => {
    const imageToRemove =
      images[index];

    if (
      imageToRemove?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imageToRemove
      );

      setImageFiles(
        (prev) =>
          prev.filter(
            (item) =>
              item.preview !==
              imageToRemove
          )
      );
    } else {
      setExistingImages(
        (prev) =>
          prev.filter(
            (url) =>
              url !==
              imageToRemove
          )
      );
    }

    setImages(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  const moveImage = (
    index,
    direction
  ) => {
    const nextIndex =
      index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >=
        images.length
    ) {
      return;
    }

    setImages((prev) => {
      const next = [
        ...prev,
      ];

      [
        next[index],
        next[nextIndex],
      ] = [
        next[nextIndex],
        next[index],
      ];

      return next;
    });
  };

  const makePrimary = (
    index
  ) => {
    if (index === 0) return;

    setImages((prev) => {
      const next = [
        ...prev,
      ];

      const [
        selectedImage,
      ] = next.splice(
        index,
        1
      );

      next.unshift(
        selectedImage
      );

      return next;
    });
  };

  // ============================================================
  // VARIANT IMAGE SELECT
  // ============================================================

  const handleVariantImageChange =
    (
      event,
      variantIndex
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select an image file."
        );

        return;
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setVariants(
        (prev) =>
          prev.map(
            (variant, index) =>
              index ===
              variantIndex
                ? {
                    ...variant,

                    /*
                     * Do not put the
                     * blob URL into
                     * imageUrl.
                     *
                     * It is only a
                     * browser preview.
                     */
                    imageFile:
                      file,

                    imagePreview:
                      preview,
                  }
                : variant
          )
      );

      event.target.value = "";
    };

  const removeVariantImage =
    (variantIndex) => {
      setVariants(
        (prev) =>
          prev.map(
            (variant, index) => {
              if (
                index !==
                variantIndex
              ) {
                return variant;
              }

              if (
                variant.imagePreview?.startsWith(
                  "blob:"
                )
              ) {
                URL.revokeObjectURL(
                  variant.imagePreview
                );
              }

              return {
                ...variant,

                imageFile:
                  null,

                imagePreview:
                  "",

                imageUrl:
                  "",
              };
            }
          )
      );
    };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

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

      if (data.archived) {
        setDeleteResult({
          type: "archived",
          title: "Product Archived",
          message:
            "This product has existing orders, so it cannot be permanently deleted. The product has been archived and is now inactive. Existing customer orders will remain intact.",
        });
      } else {
        setDeleteResult({
          type: "deleted",
          title: "Product Deleted",
          message:
            "The product has been permanently deleted successfully.",
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete product"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  // GENERIC R2 UPLOAD
  // ============================================================

  const uploadFile = async (
    file,
    folder
  ) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "folder",
      folder
    );

    const response =
      await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Image upload failed"
      );
    }

    if (!data.url) {
      throw new Error(
        "Image upload did not return a URL"
      );
    }

    return data.url;
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave =
    async () => {
      try {
        if (!name.trim()) {
          alert(
            "Product name is required."
          );

          return;
        }

        if (
          !sellingPrice ||
          Number(sellingPrice) <=
            0
        ) {
          alert(
            "Valid selling price is required."
          );

          return;
        }

        const selectedCategory =
          categories.find(
            (c) =>
              c.name ===
              category
          );

        if (
          !selectedCategory
        ) {
          alert(
            "Please select a category."
          );

          return;
        }

        const newProductImages =
          imageFiles.length;

        const newVariantImages =
          variants.filter(
            (variant) =>
              variant.imageFile
          ).length;

        const totalUploads =
          newProductImages +
          newVariantImages;

        setIsUploading(true);

        setUploadProgress({
          completed: 0,
          total:
            totalUploads,
        });

        // --------------------------------------------------------
        // Upload product images
        // --------------------------------------------------------

        const uploadedProductImages =
          new Map();

        for (
          const item of imageFiles
        ) {
          const url =
            await uploadFile(
              item.file,
              "products"
            );

          uploadedProductImages.set(
            item.preview,
            url
          );

          setUploadProgress(
            (prev) => ({
              ...prev,
              completed:
                prev.completed +
                1,
            })
          );
        }

        const finalImages =
          images
            .map(
              (image) =>
                uploadedProductImages.get(
                  image
                ) || image
            )
            .filter(
              (image) =>
                !image.startsWith(
                  "blob:"
                )
            );

        // --------------------------------------------------------
        // Upload variant images
        // --------------------------------------------------------

        const finalVariants =
          [];

        for (
          const variant of variants
        ) {
          let finalImageUrl =
            variant.imageUrl ||
            null;

          if (
            variant.imageFile
          ) {
            finalImageUrl =
              await uploadFile(
                variant.imageFile,
                "variants"
              );

            setUploadProgress(
              (prev) => ({
                ...prev,
                completed:
                  prev.completed +
                  1,
              })
            );
          }

          finalVariants.push(
            {
              id:
                variant.id,

              name:
                variant.name,

              sku:
                variant.sku,

              price:
                Number(
                  variant.price
                ) || 0,

              stock:
                Number(
                  variant.stock
                ) || 0,

              imageUrl:
                finalImageUrl,

              isActive:
                variant.isActive !==
                false,
            }
          );
        }

        // --------------------------------------------------------
        // Payload
        // --------------------------------------------------------

        const payload = {
          name:
            name.trim(),

          slug:
            isEditing
              ? slug
              : undefined,

          description:
            description.trim(),

          price:
            Number(
              sellingPrice
            ),

          stock:
            Number(
              stock || 0
            ),

          categoryId:
            selectedCategory.id,

          featured,

          isNewArrival,

          isBestSeller,

          isActive:
            status !==
            "Out of Stock",

          images:
            finalImages,

          variants:
            finalVariants,
        };

        const endpoint =
          isEditing
            ? `/api/admin/products/${editId}`
            : "/api/admin/products";

        const res =
          await fetch(
            endpoint,
            {
              method:
                isEditing
                  ? "PATCH"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to save product"
          );
        }

        router.push(
          "/admin/products"
        );

        router.refresh();
      } catch (error) {
        console.error(
          "Save product error:",
          error
        );

        alert(
          error.message ||
            "Failed to save product"
        );
      } finally {
        setIsUploading(false);
      }
    };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            router.push(
              "/admin/products"
            )
          }
          className="p-2 rounded-xl bg-green-900 hover:bg-green-800 text-green-400 hover:text-white transition-colors"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <div>
          <h1 className="text-white text-2xl font-bold">
            {isEditing
              ? "Edit Product"
              : "Add New Product"}
          </h1>

          <p className="text-green-400 text-sm mt-0.5">
            {isEditing
              ? "Modify product details and pricing"
              : "Create a new product with details, prices, and variants"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================================================
            LEFT
        ====================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFORMATION */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">

            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">
              Basic Information
            </h2>

            <FormInput
              label="Product Name"
              id="name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="e.g. Royal Silk Saree"
              required
            />

            <FormInput
              label="Description"
              id="desc"
              type="textarea"
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Detailed description of the product..."
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <FormInput
                label="Category"
                id="category"
                type="select"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                options={categories.map(
                  (c) =>
                    c.name
                )}
              />

              <FormInput
                label="Rating"
                id="rating"
                type="number"
                value={rating}
                onChange={(e) => {
                  const value =
                    e.target
                      .value;

                  if (
                    value ===
                      "" ||
                    (Number(
                      value
                    ) >= 0 &&
                      Number(
                        value
                      ) <= 5)
                  ) {
                    setRating(
                      value
                    );
                  }
                }}
                min="0"
                max="5"
                step="0.1"
                placeholder="0.0"
              />

            </div>
          </div>

          {/* HOMEPAGE */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">

            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">
              Homepage Placement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <Toggle
                checked={
                  featured
                }
                onChange={
                  setFeatured
                }
                label="Featured"
              />

              <Toggle
                checked={
                  isNewArrival
                }
                onChange={
                  setIsNewArrival
                }
                label="New Arrival"
              />

              <Toggle
                checked={
                  isBestSeller
                }
                onChange={
                  setIsBestSeller
                }
                label="Best Seller"
              />

            </div>
          </div>

          {/* PRICING */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">

            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <FormInput
                label="Actual Price (₹)"
                id="actualPrice"
                type="number"
                value={
                  actualPrice
                }
                onChange={(e) =>
                  setActualPrice(
                    e.target.value
                  )
                }
                placeholder="0"
                required
              />

              <div className="relative">

                <FormInput
                  label="Selling Price (₹)"
                  id="sellingPrice"
                  type="number"
                  value={
                    sellingPrice
                  }
                  onChange={(e) =>
                    setSellingPrice(
                      e.target
                        .value
                    )
                  }
                  placeholder="0"
                  required
                />

                {discount >
                  0 && (
                  <div className="absolute right-0 top-0 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
                    {discount}%
                    OFF
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
                onChange={(e) =>
                  setStock(
                    e.target
                      .value
                  )
                }
                placeholder="0"
                required
              />

              <FormInput
                label="Status"
                id="status"
                type="select"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target
                      .value
                  )
                }
                options={[
                  "Active",
                  "Low Stock",
                  "Out of Stock",
                ]}
              />

            </div>
          </div>

          {/* ====================================================
              PRODUCT VARIANTS
          ==================================================== */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card">

            <div className="flex items-center justify-between border-b border-green-800 pb-3 mb-4">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Product Variants
                </h2>

                <p className="mt-1 text-xs text-green-400">
                  Add different versions of this product with their own price, stock and image.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  isUploading
                }
                onClick={() =>
                  setVariants(
                    (prev) => [
                      ...prev,
                      {
                        id: undefined,
                        name: "",
                        sku: "",
                        price:
                          sellingPrice ||
                          "",
                        stock: 0,

                        /*
                         * imageUrl is the
                         * final R2 URL.
                         */
                        imageUrl: "",

                        /*
                         * imageFile is
                         * the actual
                         * browser file.
                         */
                        imageFile:
                          null,

                        /*
                         * imagePreview
                         * is only used
                         * for preview.
                         */
                        imagePreview:
                          "",

                        isActive:
                          true,
                      },
                    ]
                  )
                }
                className="rounded-lg bg-gold-600 px-3 py-2 text-xs font-semibold text-green-950 hover:bg-gold-500 disabled:opacity-50"
              >
                + Add Variant
              </button>

            </div>

            {variants.length ===
            0 ? (
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

                {variants.map(
                  (
                    variant,
                    index
                  ) => (
                    <div
                      key={
                        variant.id ||
                        `new-${index}`
                      }
                      className="rounded-xl border border-green-800 bg-green-950/50 p-4"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-sm font-semibold text-white">
                          Variant{" "}
                          {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setVariants(
                              (
                                prev
                              ) =>
                                prev.filter(
                                  (
                                    _,
                                    i
                                  ) =>
                                    i !==
                                    index
                                )
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
                          value={
                            variant.name
                          }
                          placeholder="e.g. Green"
                          onChange={(
                            e
                          ) =>
                            setVariants(
                              (
                                prev
                              ) =>
                                prev.map(
                                  (
                                    item,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...item,
                                          name:
                                            e
                                              .target
                                              .value,
                                        }
                                      : item
                                )
                            )
                          }
                        />

                        <FormInput
                          label="SKU"
                          id={`variant-sku-${index}`}
                          value={
                            variant.sku
                          }
                          placeholder="e.g. SAREE-GRN-001"
                          onChange={(
                            e
                          ) =>
                            setVariants(
                              (
                                prev
                              ) =>
                                prev.map(
                                  (
                                    item,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...item,
                                          sku:
                                            e
                                              .target
                                              .value,
                                        }
                                      : item
                                )
                            )
                          }
                        />

                        <FormInput
                          label="Price (₹)"
                          id={`variant-price-${index}`}
                          type="number"
                          value={
                            variant.price
                          }
                          onChange={(
                            e
                          ) =>
                            setVariants(
                              (
                                prev
                              ) =>
                                prev.map(
                                  (
                                    item,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...item,
                                          price:
                                            e
                                              .target
                                              .value,
                                        }
                                      : item
                                )
                            )
                          }
                        />

                        <FormInput
                          label="Stock"
                          id={`variant-stock-${index}`}
                          type="number"
                          value={
                            variant.stock ??
                            ""
                          }
                          placeholder="0"
                          onChange={(
                            e
                          ) => {
                            const value =
                              e.target
                                .value;

                            setVariants(
                              (
                                prev
                              ) =>
                                prev.map(
                                  (
                                    item,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...item,
                                          stock:
                                            value ===
                                            ""
                                              ? ""
                                              : Number(
                                                  value
                                                ),
                                        }
                                      : item
                                )
                            );
                          }}
                        />

                      </div>

                      {/* ==================================================
                          VARIANT IMAGE UPLOAD
                      ================================================== */}

                      <div className="mt-4">

                        <label className="text-green-300 text-xs font-medium">
                          Variant Image
                        </label>

                        <div className="mt-1.5">

                          {variant.imagePreview ? (
                            <div className="relative w-full max-w-[220px]">

                              <div className="aspect-square overflow-hidden rounded-xl border border-green-700 bg-green-950">

                                <img
                                  src={
                                    variant.imagePreview
                                  }
                                  alt={`${variant.name || "Variant"} preview`}
                                  className="h-full w-full object-cover"
                                />

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantImage(
                                    index
                                  )
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
                                aria-label="Remove variant image"
                              >
                                <X
                                  size={
                                    15
                                  }
                                />
                              </button>

                              <div className="mt-2 flex items-center gap-2">

                                <span className="rounded-full bg-green-800 px-2 py-1 text-[10px] text-green-300">
                                  {variant.imageFile
                                    ? "New image selected"
                                    : "Saved image"}
                                </span>

                              </div>

                            </div>
                          ) : (
                            <label className="flex min-h-[150px] w-full max-w-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-700 bg-green-950/40 text-green-400 transition-colors hover:border-gold-500 hover:bg-green-800/40 hover:text-gold-500">

                              <Upload
                                size={
                                  28
                                }
                              />

                              <span className="mt-2 text-xs font-semibold">
                                Upload Variant Image
                              </span>

                              <span className="mt-1 text-[10px] text-green-500">
                                PNG, JPG or WEBP
                              </span>

                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(
                                  e
                                ) =>
                                  handleVariantImageChange(
                                    e,
                                    index
                                  )
                                }
                              />

                            </label>
                          )}

                        </div>

                      </div>

                      <div className="mt-4">

                        <Toggle
                          checked={
                            variant.isActive
                          }
                          onChange={(
                            value
                          ) =>
                            setVariants(
                              (
                                prev
                              ) =>
                                prev.map(
                                  (
                                    item,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...item,
                                          isActive:
                                            value,
                                        }
                                      : item
                                )
                            )
                          }
                          label="Active"
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            RIGHT COLUMN
        ====================================================== */}

        <div className="space-y-6">

          {/* PRODUCT IMAGES */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card space-y-4">

            <h2 className="text-lg font-semibold text-white border-b border-green-800 pb-2 mb-4">
              Product Images
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">

              {images.map(
                (img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-green-700 bg-green-950"
                  >

                    <img
                      src={img}
                      alt={`Product ${idx}`}
                      className="w-full h-full object-cover"
                    />

                    {idx ===
                      0 && (
                      <span className="absolute left-2 top-2 rounded bg-gold-600 px-2 py-0.5 text-[10px] font-semibold text-green-950">
                        Primary
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      {idx !==
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            makePrimary(
                              idx
                            )
                          }
                          className="rounded-lg bg-gold-600 px-2 py-1 text-xs font-semibold text-green-950 hover:bg-gold-500"
                        >
                          Make Primary
                        </button>
                      )}

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              idx,
                              -1
                            )
                          }
                          disabled={
                            idx ===
                            0
                          }
                          className="p-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-40"
                        >
                          <ArrowUp
                            size={
                              16
                            }
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              idx,
                              1
                            )
                          }
                          disabled={
                            idx ===
                            images.length -
                              1
                          }
                          className="p-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-40"
                        >
                          <ArrowDown
                            size={
                              16
                            }
                          />
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(
                            idx
                          )
                        }
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>

                    </div>
                  </div>
                )
              )}

              <label
                className="
                  aspect-square
                  rounded-xl
                  border-2
                  border-dashed
                  border-green-700
                  hover:border-gold-500
                  hover:bg-green-800/50
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-green-500
                  hover:text-gold-500
                  transition-colors
                  cursor-pointer
                "
              >

                <Upload
                  size={24}
                  className="mb-2"
                />

                <span className="text-xs font-medium">
                  Upload Image
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>

            </div>

            {images.length ===
              0 && (
              <div className="flex items-start gap-2 p-3 bg-green-950/50 border border-green-800 rounded-xl text-green-400 text-xs">

                <ImageIcon
                  size={16}
                  className="shrink-0 mt-0.5"
                />

                <p>
                  Upload at least
                  one image for
                  your product to
                  make it stand
                  out.
                </p>

              </div>
            )}
          </div>

          {/* SAVE / DELETE */}

          <div className="bg-green-900 border border-green-800 rounded-2xl p-6 shadow-card">

            {isUploading && (
              <div className="mb-4 rounded-xl border border-green-800 bg-green-950/50 p-3 text-xs text-green-300">

                Uploading images{" "}
                {
                  uploadProgress.completed
                }
                /
                {
                  uploadProgress.total
                }
                ...

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-green-800">

                  <div
                    className="h-full rounded-full bg-gold-500 transition-all"
                    style={{
                      width: `${
                        uploadProgress.total
                          ? (uploadProgress.completed /
                              uploadProgress.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />

                </div>
              </div>
            )}

            <Button
              onClick={
                handleSave
              }
              disabled={
                isUploading
              }
              className="w-full justify-center text-base py-3"
            >
              {isUploading
                ? `Uploading ${uploadProgress.completed}/${uploadProgress.total}...`
                : isEditing
                  ? "Save Changes"
                  : "Save Product"}
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                router.push(
                  "/admin/products"
                )
              }
              className="w-full justify-center text-base py-3 mt-3"
            >
              Cancel
            </Button>

            {isEditing && (
              <Button
                variant="danger"
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
                className="w-full justify-center text-base py-3 mt-4"
              >
                Delete Product
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-md rounded-2xl border border-green-800 bg-green-950 p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2
                size={22}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Delete Product?
            </h2>

            <p className="mt-3 text-sm leading-6 text-green-300">

              Are you sure you
              want to delete{" "}

              <span className="font-semibold text-white">
                {name}
              </span>

              ? This action
              cannot be undone.

            </p>

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                className="
                  rounded-lg
                  border
                  border-green-700
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-green-200
                  hover:bg-green-900
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={
                  handleDelete
                }
                className="
                  rounded-lg
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Product"}
              </button>

            </div>
          </div>
        </div>
      )}

      {deleteResult && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-2xl border border-[#D4A437]/30 bg-[#003D2B] p-7 shadow-2xl">
            
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4A437]/15">
              <span className="text-2xl text-[#D4A437]">
                {deleteResult.type === "archived"
                  ? "!"
                  : "✓"}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-[#F5EBD8]">
              {deleteResult.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#D7CDBD]">
              {deleteResult.message}
            </p>

            <button
              type="button"
              onClick={() => {
                setDeleteResult(null);
                router.push("/admin/products");
                router.refresh();
              }}
              className="mt-7 w-full rounded-lg bg-[#D4A437] px-5 py-3 text-sm font-semibold text-[#003D2B] transition hover:bg-[#C4952F]"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-white">
          Loading...
        </div>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}