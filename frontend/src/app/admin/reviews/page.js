"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Star,
  Flag,
  Trash2,
  Image as ImageIcon,
  X,
} from "lucide-react";

import Pagination from "../../../components/ui/Pagination";

const PAGE_SIZE = 8;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={12}
            className={
              star <= rating
                ? "text-gold-500 fill-gold-500"
                : "text-green-700"
            }
          />
        )
      )}
    </div>
  );
}

function getImageUrl(key) {
  if (!key) {
    return "";
  }

  return `/api/images/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function parseImages(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("All");

  const [filterRating, setFilterRating] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const loadReviews =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/admin/reviews",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          throw new Error(
            text ||
              "Invalid server response."
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load reviews."
          );
        }

        const rows =
          Array.isArray(
            data?.data
          )
            ? data.data
            : [];

        setReviews(
          rows.map((review) => ({
            ...review,
            rating: Number(
              review.rating
            ),
            image_keys:
              parseImages(
                review.image_keys
              ),
          }))
        );
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err
        );

        setError(
          err?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const flagReview = async (
    review
  ) => {
    const reason =
      window.prompt(
        "Reason for flagging this review:",
        "Requires administrative review"
      );

    if (reason === null) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/reviews/${review.id}/flag`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              reason:
                reason.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to flag review."
        );
      }

      await loadReviews();
    } catch (err) {
      console.error(
        "Failed to flag review:",
        err
      );

      window.alert(
        err?.message ||
          "Unable to flag review."
      );
    }
  };

  const deleteReview =
    async (review) => {
      const confirmed =
        window.confirm(
          `Delete review #${review.id}? This will also remove its uploaded review images.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          review.id
        );

        const response =
          await fetch(
            `/api/admin/reviews/${review.id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to delete review."
          );
        }

        setSelectedReview(
          null
        );

        await loadReviews();
      } catch (err) {
        console.error(
          "Failed to delete review:",
          err
        );

        window.alert(
          err?.message ||
            "Unable to delete review."
        );
      } finally {
        setDeletingId(null);
      }
    };

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reviews.filter(
        (review) => {
          const reviewer =
            String(
              review.reviewer_name ||
                ""
            ).toLowerCase();

          const product =
            String(
              review.product_name ||
                ""
            ).toLowerCase();

          const comment =
            String(
              review.comment ||
                ""
            ).toLowerCase();

          const matchSearch =
            !query ||
            reviewer.includes(
              query
            ) ||
            product.includes(
              query
            ) ||
            comment.includes(
              query
            );

          const status =
            String(
              review.status ||
                "Approved"
            );

          const matchStatus =
            filterStatus ===
              "All" ||
            status ===
              filterStatus;

          const matchRating =
            filterRating ===
              0 ||
            Number(
              review.rating
            ) === filterRating;

          return (
            matchSearch &&
            matchStatus &&
            matchRating
          );
        }
      );
    }, [
      reviews,
      search,
      filterStatus,
      filterRating,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          PAGE_SIZE
      )
    );

  const paginated =
    filtered.slice(
      (page - 1) *
        PAGE_SIZE,
      page * PAGE_SIZE
    );

  const stats = {
    total: reviews.length,

    published:
      reviews.filter(
        (review) =>
          String(
            review.status ||
              ""
          ).toLowerCase() ===
          "approved"
      ).length,

    flagged:
      reviews.filter(
        (review) =>
          String(
            review.status ||
              ""
          ).toLowerCase() ===
          "flagged"
      ).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">
          Reviews & Ratings
        </h1>

        <p className="text-green-400 text-sm mt-0.5">
          Verified-purchase reviews
          published automatically
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          [
            "Total Reviews",
            stats.total,
          ],
          [
            "Published",
            stats.published,
          ],
          [
            "Flagged",
            stats.flagged,
          ],
        ].map(
          ([label, value]) => (
            <div
              key={label}
              className="bg-green-900 border border-green-800 rounded-xl p-4"
            >
              <p className="text-green-400 text-xs uppercase tracking-wider mb-1">
                {label}
              </p>

              <p className="text-white text-2xl font-bold">
                {value}
              </p>
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"
          />

          <input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search reviewer, product or review..."
            className="w-full bg-green-900 border border-green-700 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex gap-1 bg-green-900 p-1 rounded-xl">
          {[
            "All",
            "Approved",
            "Flagged",
          ].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setFilterStatus(
                    status
                  );
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus ===
                  status
                    ? "bg-gold-600 text-green-950"
                    : "text-green-400 hover:text-white"
                }`}
              >
                {status ===
                "Approved"
                  ? "Published"
                  : status}
              </button>
            )
          )}
        </div>

        <select
          value={filterRating}
          onChange={(event) => {
            setFilterRating(
              Number(
                event.target
                  .value
              )
            );
            setPage(1);
          }}
          className="bg-green-900 border border-green-700 text-green-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
        >
          <option value={0}>
            All Stars
          </option>

          {[5, 4, 3, 2, 1].map(
            (rating) => (
              <option
                key={rating}
                value={rating}
              >
                {rating} Star
                {rating > 1
                  ? "s"
                  : ""}
              </option>
            )
          )}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-800">
                {[
                  "Reviewer",
                  "Product",
                  "Rating",
                  "Comment",
                  "Photos",
                  "Date",
                  "Status",
                  "Actions",
                ].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-green-500"
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : paginated.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-green-500"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                paginated.map(
                  (review) => {
                    const status =
                      review.status ||
                      "Approved";

                    const images =
                      Array.isArray(
                        review.image_keys
                      )
                        ? review.image_keys
                        : [];

                    return (
                      <tr
                        key={
                          review.id
                        }
                        className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-white text-xs font-medium">
                          {review.reviewer_name ||
                            "Verified Customer"}
                        </td>

                        <td className="px-4 py-3 text-green-300 text-xs max-w-[160px] truncate">
                          {review.product_name ||
                            `Product #${review.product_id}`}
                        </td>

                        <td className="px-4 py-3">
                          <StarRating
                            rating={Number(
                              review.rating
                            )}
                          />
                        </td>

                        <td className="px-4 py-3 text-green-300 text-xs max-w-[220px] truncate">
                          {review.comment ||
                            ""}
                        </td>

                        <td className="px-4 py-3">
                          {images.length >
                          0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedReview(
                                  review
                                )
                              }
                              className="inline-flex items-center gap-1 text-green-300 hover:text-white text-xs"
                            >
                              <ImageIcon
                                size={14}
                              />
                              {
                                images.length
                              }
                            </button>
                          ) : (
                            <span className="text-green-700 text-xs">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-green-500 text-xs">
                          {review.created_at
                            ? new Date(
                                review.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                              String(
                                status
                              ).toLowerCase() ===
                              "flagged"
                                ? "bg-orange-900/60 text-orange-300"
                                : "bg-green-800 text-green-300"
                            }`}
                          >
                            {String(
                              status
                            ).toLowerCase() ===
                            "approved"
                              ? "Published"
                              : status}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                flagReview(
                                  review
                                )
                              }
                              disabled={
                                String(
                                  status
                                ).toLowerCase() ===
                                "flagged"
                              }
                              className="p-1.5 rounded-lg bg-orange-900/50 hover:bg-orange-800 text-orange-400 hover:text-white disabled:opacity-40 transition-colors"
                              title="Flag review"
                            >
                              <Flag
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteReview(
                                  review
                                )
                              }
                              disabled={
                                deletingId ===
                                review.id
                              }
                              className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 hover:text-white disabled:opacity-40 transition-colors"
                              title="Delete review"
                            >
                              <Trash2
                                size={13}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-green-800 flex items-center justify-between">
          <p className="text-green-500 text-xs">
            {filtered.length} review
            {filtered.length !==
            1
              ? "s"
              : ""}
          </p>

          <Pagination
            page={page}
            totalPages={
              totalPages
            }
            onPage={setPage}
          />
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-green-800 bg-green-950 p-5">
            <button
              type="button"
              onClick={() =>
                setSelectedReview(
                  null
                )
              }
              className="absolute right-4 top-4 text-green-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="pr-8 text-lg font-semibold text-white">
              Review #
              {
                selectedReview.id
              }
            </h2>

            <p className="mt-1 text-xs text-green-400">
              {
                selectedReview.reviewer_name
              }{" "}
              ·{" "}
              {
                selectedReview.product_name
              }
            </p>

            <div className="mt-4">
              <StarRating
                rating={Number(
                  selectedReview.rating
                )}
              />
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-green-200">
              {
                selectedReview.comment
              }
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(
                selectedReview.image_keys ||
                []
              ).map(
                (key) => (
                  <a
                    key={key}
                    href={getImageUrl(
                      key
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden rounded-lg border border-green-800 bg-green-900"
                  >
                    <img
                      src={getImageUrl(
                        key
                      )}
                      alt="Review"
                      className="h-full w-full object-cover"
                    />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}