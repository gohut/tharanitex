"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Star,
  Camera,
  X,
} from "lucide-react";

const MAX_IMAGES = 5;

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ReviewOrderItem({
  orderId,
  item,
  orderStatus,
  alreadyReviewed = false,
}) {
  const [open, setOpen] =
    useState(false);

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [images, setImages] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [reviewSubmitted, setReviewSubmitted] =
    useState(Boolean(alreadyReviewed));

  const [reviewedItems, setReviewedItems] =
    useState({});

  const fileInputRef =
    useRef(null);

  useEffect(() => {
    if (alreadyReviewed) {
      setReviewSubmitted(true);
    }
  }, [alreadyReviewed]);

  const normalizedStatus =
    String(orderStatus || "").toLowerCase();

  const isDelivered =
    normalizedStatus === "delivered";

  /*
   * Create image previews.
   */
  useEffect(() => {
    const urls = images.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [images]);

  const addImages = (event) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = [];

    let errorMessage = "";

    for (const file of selectedFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        errorMessage =
          "Only JPG, PNG and WEBP images are allowed.";

        continue;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        errorMessage =
          "Each image must be 5 MB or smaller.";

        continue;
      }

      validFiles.push(file);
    }

    const remainingSlots =
      MAX_IMAGES - images.length;

    const filesToAdd =
      validFiles.slice(
        0,
        remainingSlots
      );

    if (
      validFiles.length >
      remainingSlots
    ) {
      errorMessage =
        `You can add up to ${MAX_IMAGES} images.`;
    }

    setImages((current) => [
      ...current,
      ...filesToAdd,
    ]);

    setMessage(
      errorMessage || ""
    );

    /*
     * Allows selecting the same
     * file again after removal.
     */
    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  const closeReview = () => {
    if (submitting) {
      return;
    }

    setOpen(false);
    setMessage("");
  };

  const submitReview = async () => {
    if (!rating) {
      setMessage(
        "Please select a rating."
      );

      return;
    }

    if (!comment.trim()) {
      setMessage(
        "Please write a review."
      );

      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const formData =
        new FormData();

      formData.append(
        "product_id",
        String(item.product_id)
      );

      formData.append(
        "order_id",
        String(orderId)
      );

      formData.append(
        "rating",
        String(rating)
      );

      formData.append(
        "comment",
        comment.trim()
      );

      images.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      /*
       * Do not manually set Content-Type.
       * Browser creates the multipart boundary.
       */
      const response =
        await fetch(
          "/api/customer/reviews",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Unable to submit your review."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to submit your review."
        );
      }

      /*
       * Review was successfully stored.
       */
      setComment("");
      setRating(0);
      setImages([]);
      setReviewSubmitted(true);

      /*
       * Tell the Orders page to reload
       * the order/review state immediately.
       */
      window.dispatchEvent(
        new CustomEvent("review-submitted", {
          detail: {
            orderId: String(orderId),
            productId: String(item.product_id),
          },
        })
      );

      setMessage(
        "Review submitted successfully."
      );

      setOpen(false);
    } catch (error) {
      console.error(
        "Review submission failed:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Already reviewed.
   */
  if (
    alreadyReviewed ||
    reviewSubmitted
  ) {
    return (
      <div className="mt-4 border border-[#DCCEBB] bg-[#FFF9EF] px-4 py-3 text-center">
        <span className="text-sm font-semibold text-[#7B6B59]">
          ✓ Reviewed
        </span>
      </div>
    );
  }

  /*
   * Only delivered orders can be reviewed.
   */
  if (!isDelivered) {
    return (
      <div className="mt-4 text-right text-xs text-[#A69B90]">
        Review available after delivery
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setMessage("");
          }}
          className="inline-flex min-h-11 items-center justify-center border border-[#E0A22E] bg-[#FFF9EF] px-5 py-3 text-sm font-semibold text-[#D38E2E] transition hover:bg-[#FFF1D1]"
        >
          ⭐ Rate & Review
        </button>
      ) : (
        <div className="border border-[#E3D3BE] bg-[#FFF9EF] p-4">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-[#5E4933]">
              Review this product
            </h4>

            <button
              type="button"
              onClick={closeReview}
              className="text-xs text-[#8A8175] hover:text-[#D38E2E]"
            >
              Close
            </button>
          </div>

          {/* Rating */}
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setRating(star)
                  }
                  aria-label={`Rate ${star} out of 5`}
                >
                  <Star
                    size={22}
                    fill={
                      star <= rating
                        ? "#F3A900"
                        : "transparent"
                    }
                    color="#F3A900"
                  />
                </button>
              )
            )}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            rows={4}
            placeholder="Share your experience with this product..."
            className="mt-4 w-full resize-none border border-[#E2D5C4] bg-white p-3 text-sm text-[#5E4933] outline-none focus:border-[#D38E2E]"
          />

          {/* Images */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#5E4933]">
                Add photos
              </p>

              <span className="text-[11px] text-[#A69B90]">
                {images.length}/
                {MAX_IMAGES}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={addImages}
            />

            <button
              type="button"
              disabled={
                images.length >=
                MAX_IMAGES
              }
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-2 inline-flex items-center gap-2 border border-dashed border-[#D9C5A8] bg-white px-4 py-3 text-xs font-medium text-[#8B6A43] transition hover:border-[#D38E2E] hover:text-[#D38E2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={16} />
              Add Photos
            </button>

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {previews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={`${preview}-${index}`}
                      className="relative aspect-square overflow-hidden border border-[#E3D3BE] bg-white"
                    >
                      <img
                        src={preview}
                        alt={`Review photo ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                        aria-label="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <p className="mt-2 text-[10px] text-[#A69B90]">
              JPG, PNG or WEBP · Max
              5 MB each · Up to 5
              photos
            </p>
          </div>

          {message && (
            <p className="mt-3 text-xs text-[#8B6A43]">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={submitReview}
            disabled={submitting}
            className="mt-4 w-full bg-[#D38E2E] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#B77719] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
}