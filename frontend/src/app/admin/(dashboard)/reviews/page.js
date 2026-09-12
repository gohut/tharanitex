"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Star, Flag, Trash2, Image as ImageIcon, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={
            star <= rating
              ? "text-[#D4AF37] fill-[#D4AF37]"
              : "text-[#DCD5C9]"
          }
        />
      ))}
    </div>
  );
}

function getImageUrl(key) {
  if (!key) return "";
  return `/api/images/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function parseImages(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRating, setFilterRating] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reviews", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load reviews.");
      }

      const rows = Array.isArray(data?.data) ? data.data : [];
      setReviews(
        rows.map((review) => ({
          ...review,
          rating: Number(review.rating),
          image_keys: parseImages(review.image_keys),
        }))
      );
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError(err?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const flagReview = async (review) => {
    const reason = window.prompt(
      "Reason for flagging this review:",
      "Requires administrative review"
    );
    if (reason === null) return;

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}/flag`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to flag review.");
      }
      await loadReviews();
    } catch (err) {
      console.error("Failed to flag review:", err);
      window.alert(err?.message || "Unable to flag review.");
    }
  };

  const deleteReview = async (review) => {
    const confirmed = window.confirm(
      `Delete review #${review.id}? This will also remove its uploaded review images.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(review.id);
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to delete review.");
      }
      setSelectedReview(null);
      await loadReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
      window.alert(err?.message || "Unable to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const reviewer = String(review.reviewer_name || "").toLowerCase();
      const product = String(review.product_name || "").toLowerCase();
      const comment = String(review.comment || "").toLowerCase();

      const matchSearch =
        !query ||
        reviewer.includes(query) ||
        product.includes(query) ||
        comment.includes(query);

      const status = String(review.status || "Approved");
      const matchStatus =
        filterStatus === "All" ||
        status.toLowerCase() === filterStatus.toLowerCase();

      const matchRating =
        filterRating === 0 || Number(review.rating) === filterRating;

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, search, filterStatus, filterRating]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: reviews.length,
    published: reviews.filter(
      (review) => String(review.status || "").toLowerCase() === "approved"
    ).length,
    flagged: reviews.filter(
      (review) => String(review.status || "").toLowerCase() === "flagged"
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2B27]">Reviews & Ratings</h1>
          <p className="text-sm text-[#7C7267] mt-0.5">
            Verified-purchase reviews published automatically
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: stats.total, color: "text-[#2F2B27]" },
          { label: "Published Reviews", value: stats.published, color: "text-[#8C6D1F]" },
          { label: "Flagged Reviews", value: stats.flagged, color: "text-[#A93226]" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-[#E8DCC8] rounded-xl p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7C7267] mb-1">
              {item.label}
            </p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91]"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search reviewer, product or comment..."
            className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#A89F91] text-sm rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="flex gap-1 bg-[#FAF6F0] border border-[#E8DCC8] p-1 rounded-xl">
          {["All", "Approved", "Flagged"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-[#D4AF37] text-[#2F2B27] shadow-sm"
                  : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-white/60"
              }`}
            >
              {status === "Approved" ? "Published" : status}
            </button>
          ))}
        </div>

        <select
          value={filterRating}
          onChange={(event) => {
            setFilterRating(Number(event.target.value));
            setPage(1);
          }}
          className="bg-white border border-[#E8DCC8] text-[#2F2B27] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37]"
        >
          <option value={0}>All Ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} Star{rating > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white border border-[#E8DCC8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAF6F0] border-b border-[#E8DCC8]">
                {["Reviewer", "Product", "Rating", "Comment", "Photos", "Date", "Status", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[#7C7267] text-xs font-semibold uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8DCC8]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#7C7267]">
                    Loading reviews...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#7C7267]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                paginated.map((review) => {
                  const status = review.status || "Approved";
                  const isFlagged = String(status).toLowerCase() === "flagged";
                  const images = Array.isArray(review.image_keys) ? review.image_keys : [];

                  return (
                    <tr
                      key={review.id}
                      onClick={() => setSelectedReview(review)}
                      className="cursor-pointer hover:bg-[#FAF6F0]/60 transition-colors"
                      title="Click to view full review details"
                    >
                      <td className="px-4 py-3.5 text-[#2F2B27] text-xs font-bold">
                        {review.reviewer_name || "Verified Customer"}
                      </td>

                      <td className="px-4 py-3.5 text-[#2F2B27] text-xs max-w-[160px] truncate">
                        {review.product_name || `Product #${review.product_id}`}
                      </td>

                      <td className="px-4 py-3.5">
                        <StarRating rating={Number(review.rating)} />
                      </td>

                      <td className="px-4 py-3.5 text-[#7C7267] text-xs max-w-[220px] truncate">
                        {review.comment || "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        {images.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#8C6D1F] text-xs font-bold">
                            <ImageIcon size={14} />
                            {images.length}
                          </span>
                        ) : (
                          <span className="text-[#A89F91] text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[#7C7267] text-xs whitespace-nowrap">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            isFlagged
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-[#FAF3E0] text-[#8C6D1F] border border-[#E8DCC8]"
                          }`}
                        >
                          {isFlagged ? "Flagged" : "Published"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              flagReview(review);
                            }}
                            disabled={isFlagged}
                            className="p-1.5 rounded-lg border border-[#E8DCC8] bg-white hover:bg-orange-50 text-orange-600 disabled:opacity-40 transition-colors"
                            title="Flag review"
                          >
                            <Flag size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteReview(review);
                            }}
                            disabled={deletingId === review.id}
                            className="p-1.5 rounded-lg border border-[#E8DCC8] bg-white hover:bg-red-50 text-red-600 disabled:opacity-40 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 bg-[#FAF6F0]/40 border-t border-[#E8DCC8] flex items-center justify-between">
          <p className="text-[#7C7267] text-xs font-medium">
            Showing {paginated.length} of {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </p>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedReview(null)}
              className="absolute right-4 top-4 p-2 rounded-lg text-[#7C7267] hover:text-[#2F2B27] hover:bg-[#FAF6F0] transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="pr-8 text-lg font-bold text-[#2F2B27]">
              Review #{selectedReview.id}
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8C6D1F]">
              {selectedReview.reviewer_name} · {selectedReview.product_name}
            </p>

            <div className="mt-4">
              <StarRating rating={Number(selectedReview.rating)} />
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#2F2B27] bg-[#FAF6F0] p-4 rounded-xl border border-[#E8DCC8]">
              {selectedReview.comment || "No comment provided."}
            </p>

            {Array.isArray(selectedReview.image_keys) && selectedReview.image_keys.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7267] mb-2">
                  Attached Photos ({selectedReview.image_keys.length})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {selectedReview.image_keys.map((key) => (
                    <a
                      key={key}
                      href={getImageUrl(key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#FAF6F0] hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={getImageUrl(key)}
                        alt="Customer Review Photo"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}