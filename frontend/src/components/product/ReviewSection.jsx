"use client";

import { useMemo, useState } from "react";
import { Star, X } from "lucide-react";

function formatReviewDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getImageUrl(key) {
  if (!key) return "";

  return `/api/images/${String(key)
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function parseImages(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function normalizeReview(review) {
  return {
    id: review?.id,

    name:
      review?.reviewer_name ||
      review?.name ||
      review?.reviewer ||
      "Verified Customer",

    rating: Number(review?.rating || 0),

    comment:
      review?.comment ||
      review?.review_text ||
      "",

    date:
      review?.date ||
      formatReviewDate(review?.created_at) ||
      "",

    imageKeys: parseImages(
      review?.image_keys
    ),
  };
}

export default function ReviewSection({
  reviews = [],
}) {
  const [visibleReviews, setVisibleReviews] =
    useState(4);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const safeReviews = useMemo(() => {
    if (!Array.isArray(reviews)) {
      return [];
    }

    return reviews
      .map(normalizeReview)
      .filter(
        (review) =>
          review.id &&
          review.rating >= 1 &&
          review.rating <= 5 &&
          review.comment
      );
  }, [reviews]);

  const average =
    safeReviews.length > 0
      ? safeReviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / safeReviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) =>
      safeReviews.filter(
        (review) =>
          review.rating === rating
      ).length
  );

  return (
    <>
      <section className="mx-auto max-w-[1420px] px-5 pb-20 pt-16 md:px-8 lg:px-10">
        <h2 className="text-center font-klaristha text-[34px] uppercase tracking-[0.02em] text-[#D38E2E] md:text-[46px]">
          Ratings and Reviews
        </h2>

        <div className="mt-9 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Rating Summary */}
          <div className="border border-[#ECDDC7] bg-[#FCF6EC] p-6">
            <h3 className="text-center text-[58px] font-light leading-none text-[#D38E2E] md:text-[72px]">
              {average.toFixed(1)}
            </h3>

            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={
                      star <=
                      Math.round(
                        average
                      )
                        ? "#F3A900"
                        : "transparent"
                    }
                    color="#F3A900"
                  />
                )
              )}
            </div>

            <p className="mt-2 text-center text-xs text-[#B8A898]">
              Based on{" "}
              {safeReviews.length}{" "}
              {safeReviews.length === 1
                ? "review"
                : "reviews"}
            </p>

            <div className="mt-7 space-y-3">
              {[5, 4, 3, 2, 1].map(
                (rating, index) => {
                  const count =
                    ratingCounts[index];

                  const width =
                    safeReviews.length ===
                    0
                      ? 0
                      : (count /
                          safeReviews.length) *
                        100;

                  return (
                    <div
                      key={rating}
                      className="grid grid-cols-[14px_16px_1fr_34px] items-center gap-2"
                    >
                      <span className="text-xs text-[#8B7F73]">
                        {rating}
                      </span>

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
                        {Math.round(
                          width
                        )}
                        %
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-8 border border-[#E8D8C3] bg-white p-4 text-center">
              <p className="text-xs leading-5 text-[#8B7F73]">
                Reviews and ratings are
                available only to
                customers who have
                purchased and received
                this product.
              </p>

              <p className="mt-2 text-xs font-medium text-[#D38E2E]">
                To review your purchase,
                go to My Orders.
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div className="border border-[#ECDDC7] bg-[#FCF6EC] p-4 md:p-6">
            {safeReviews.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-[#8B7F73]">
                  No approved reviews
                  yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeReviews
                  .slice(
                    0,
                    visibleReviews
                  )
                  .map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-[#F0E4D4] pb-4 last:border-b-0"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4DFC0] text-xs font-medium text-[#C58A2A]">
                          {review.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-[#5E4933]">
                                {review.name}
                              </h4>

                              <div className="mt-1 flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(
                                  (star) => (
                                    <Star
                                      key={
                                        star
                                      }
                                      size={
                                        12
                                      }
                                      fill={
                                        star <=
                                        review.rating
                                          ? "#F3A900"
                                          : "transparent"
                                      }
                                      color="#F3A900"
                                    />
                                  )
                                )}
                              </div>

                              <span className="mt-1 inline-block text-[10px] font-medium text-[#9A7750]">
                                ✓ Verified
                                Purchase
                              </span>
                            </div>

                            {review.date && (
                              <p className="text-[11px] text-[#A69B90]">
                                {
                                  review.date
                                }
                              </p>
                            )}
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6C6054]">
                            {
                              review.comment
                            }
                          </p>

                          {/* Review Photos */}
                          {review.imageKeys
                            .length >
                            0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {review.imageKeys.map(
                                (
                                  key,
                                  index
                                ) => {
                                  const imageUrl =
                                    getImageUrl(
                                      key
                                    );

                                  return (
                                    <button
                                      key={`${review.id}-${key}-${index}`}
                                      type="button"
                                      onClick={() =>
                                        setSelectedImage(
                                          imageUrl
                                        )
                                      }
                                      className="group relative h-20 w-20 overflow-hidden border border-[#E3D3BE] bg-white sm:h-24 sm:w-24"
                                      aria-label={`View review photo ${
                                        index +
                                        1
                                      }`}
                                    >
                                      <img
                                        src={
                                          imageUrl
                                        }
                                        alt={`Review photo ${
                                          index +
                                          1
                                        }`}
                                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                      />

                                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {visibleReviews <
              safeReviews.length && (
              <button
                type="button"
                onClick={() =>
                  setVisibleReviews(
                    (prev) =>
                      prev + 4
                  )
                }
                className="mx-auto mt-5 block text-sm text-[#D38E2E] transition hover:text-[#B77719]"
              >
                View All Reviews →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Review Image Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <button
            type="button"
            onClick={() =>
              setSelectedImage(null)
            }
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Close image"
          >
            <X size={22} />
          </button>

          <img
            src={selectedImage}
            alt="Review"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="max-h-[90vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </>
  );
}