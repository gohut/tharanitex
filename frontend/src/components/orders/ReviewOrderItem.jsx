"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewOrderItem({
  orderId,
  item,
  orderStatus,
  alreadyReviewed = false,
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedStatus = String(
    orderStatus || ""
  ).toLowerCase();

  const isDelivered =
    normalizedStatus === "delivered";

  const canReview =
    isDelivered && !alreadyReviewed;

  const submitReview = async () => {
    if (!rating) {
      setMessage("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(
        "/api/customer/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            product_id: Number(item.product_id),
            order_id: Number(orderId),
            rating,
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to submit your review."
        );
      }

      setMessage(
        data?.message ||
          "Your review has been submitted and is awaiting approval."
      );

      setComment("");
      setRating(0);
      setOpen(false);

      // Refresh the My Orders page so the button becomes "Reviewed"
      window.location.reload();
    } catch (error) {
      console.error(
        "Review submission failed:",
        error
      );

      setMessage(
        error.message ||
          "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReviewed) {
    return (
      <div className="mt-4 border border-[#DCCEBB] bg-[#FFF9EF] px-4 py-3 text-center">
        <span className="text-sm font-semibold text-[#7B6B59]">
          ✓ Reviewed
        </span>
      </div>
    );
  }

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
              onClick={() => setOpen(false)}
              className="text-xs text-[#8A8175] hover:text-[#D38E2E]"
            >
              Close
            </button>
          </div>

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

          <textarea
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            rows={4}
            placeholder="Share your experience with this product..."
            className="mt-4 w-full resize-none border border-[#E2D5C4] bg-white p-3 text-sm text-[#5E4933] outline-none focus:border-[#D38E2E]"
          />

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