"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewSection({ reviews, product }) {
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const average =
    safeReviews.length > 0
      ? safeReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        safeReviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) =>
    safeReviews.filter(
      (review) => Number(review.rating) === rating
    ).length
  );

  const submitReview = async () => {
    if (!product?.id) {
      setReviewMessage("Product information is missing.");
      return;
    }

    if (!reviewRating) {
      setReviewMessage("Please select a rating.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);
      setReviewMessage("");

      const response = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Unable to submit your review."
        );
      }

      setReviewComment("");
      setReviewRating(0);
      setShowReviewForm(false);
      setReviewMessage(
        "Your review has been submitted and is awaiting approval."
      );
    } catch (error) {
      console.error("Review submission failed:", error);
      setReviewMessage(
        error.message || "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1420px] px-5 pb-20 pt-16 md:px-8 lg:px-10">
      <h2 className="text-center font-klaristha text-[34px] uppercase tracking-[0.02em] text-[#D38E2E] md:text-[46px]">
        Ratings and Reviews
      </h2>

      <div className="mt-9 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="border border-[#ECDDC7] bg-[#FCF6EC] p-6">
          <h3 className="text-center text-[58px] font-light leading-none text-[#D38E2E] md:text-[72px]">
            {average.toFixed(1)}
          </h3>

          <div className="mt-3 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={star <= Math.round(average) ? "#F3A900" : "transparent"}
                color="#F3A900"
              />
            ))}
          </div>

          <p className="mt-2 text-center text-xs text-[#B8A898]">
            Based on {safeReviews.length} reviews
          </p>

          <div className="mt-7 space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingCounts[index];
              const width =
                safeReviews.length === 0
                  ? 0
                  : (count / safeReviews.length) * 100;

              return (
                <div
                  key={rating}
                  className="grid grid-cols-[14px_16px_1fr_34px] items-center gap-2"
                >
                  <span className="text-xs text-[#8B7F73]">{rating}</span>
                  <Star
                    size={12}
                    fill="#F3A900"
                    color="#F3A900"
                  />
                  <div className="h-[5px] flex-1 bg-[#E9DDCE]">
                    <div
                      className="h-[5px] bg-[#E0A032]"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-[10px] text-[#8B7F73]">
                    {Math.round(width)}%
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowReviewForm((prev) => !prev);
              setReviewMessage("");
            }}
            className="mt-8 h-[36px] w-full border border-[#E2BB6A] bg-white text-xs font-medium text-[#D38E2E] transition hover:bg-[#FFF3D9]"
          >
            {showReviewForm ? "Close Review Form" : "Write a Review"}
          </button>

          {showReviewForm && (
            <div className="mt-5 border border-[#E8D8C3] bg-white p-4">
              <h4 className="text-sm font-semibold text-[#5E4933]">
                Write your review
              </h4>

              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star
                      size={20}
                      fill={star <= reviewRating ? "#F3A900" : "transparent"}
                      color="#F3A900"
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="mt-4 w-full resize-none border border-[#E2D5C4] bg-[#FCF8F1] p-3 text-sm text-[#5E4933] outline-none focus:border-[#D38E2E]"
              />

              {reviewMessage && (
                <p className="mt-3 text-xs text-[#8B6A43]">
                  {reviewMessage}
                </p>
              )}

              <button
                type="button"
                onClick={submitReview}
                disabled={submitting}
                className="mt-4 w-full bg-[#D38E2E] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#B77719] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

        </div>

        <div className="border border-[#ECDDC7] bg-[#FCF6EC] p-4 md:p-6">
          <div className="space-y-4">
            {safeReviews.slice(0, visibleReviews).map((review) => (
              <div
                key={review.id}
                className="flex gap-4 border-b border-[#F0E4D4] pb-4 last:border-b-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4DFC0] text-xs font-medium text-[#C58A2A]">
                  {review.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#5E4933]">
                        {review.name}
                      </h4>

                      <div className="mt-1 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill={
                              star <= review.rating ? "#F3A900" : "transparent"
                            }
                            color="#F3A900"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A69B90]">
                      {review.date}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#6C6054]">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {visibleReviews < safeReviews.length && (
            <button
              onClick={() => setVisibleReviews((prev) => prev + 4)}
              className="mx-auto mt-5 block text-sm text-[#D38E2E] transition hover:text-[#B77719]"
            >
              {"View All Reviews ->"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
