"use client";

import {
  useState,
} from "react";

import {
  Search,
  Star,
  Flag,
} from "lucide-react";

import StatusBadge from "../../../components/ui/StatusBadge";
import Pagination from "../../../components/ui/Pagination";
import {
  reviews as initialReviews,
} from "../../../data/reviews";

const PAGE_SIZE = 8;

function StarRating({
  rating,
}) {
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

export default function ReviewsPage() {
  const [reviews, setReviews] =
    useState(
      initialReviews
    );

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("All");

  const [filterRating, setFilterRating] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const filtered =
    reviews.filter((review) => {
      const reviewer =
        String(
          review.reviewer ||
            ""
        ).toLowerCase();

      const product =
        String(
          review.product ||
            ""
        ).toLowerCase();

      const query =
        search.toLowerCase();

      const matchSearch =
        reviewer.includes(
          query
        ) ||
        product.includes(
          query
        );

      const matchStatus =
        filterStatus === "All" ||
        review.status ===
          filterStatus;

      const matchRating =
        filterRating === 0 ||
        review.rating ===
          filterRating;

      return (
        matchSearch &&
        matchStatus &&
        matchRating
      );
    });

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

  /*
   * Admin can flag a review
   * for internal moderation.
   *
   * Admin does NOT approve/reject
   * verified-purchase reviews.
   */
  const flagReview = (id) => {
    setReviews(
      (current) =>
        current.map(
          (review) =>
            review.id === id
              ? {
                  ...review,
                  status:
                    "Flagged",
                }
              : review
        )
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">
          Reviews & Ratings
        </h1>

        <p className="text-green-400 text-sm mt-0.5">
          Verified-purchase reviews
          across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          "Approved",
          "Flagged",
          "Pending",
        ].map((status) => (
          <div
            key={status}
            className="bg-green-900 border border-green-800 rounded-xl p-4"
          >
            <p className="text-green-400 text-xs uppercase tracking-wider mb-1">
              {status}
            </p>

            <p className="text-white text-2xl font-bold">
              {
                reviews.filter(
                  (review) =>
                    review.status ===
                    status
                ).length
              }
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
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
            placeholder="Search reviews..."
            className="w-full bg-green-900 border border-green-700 text-white placeholder-green-500 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex gap-1 bg-green-900 p-1 rounded-xl">
          {[
            "All",
            "Approved",
            "Flagged",
          ].map((status) => (
            <button
              key={status}
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
              {status}
            </button>
          ))}
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

      {/* Table */}
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
              {paginated.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-green-500"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                paginated.map(
                  (review) => (
                    <tr
                      key={
                        review.id
                      }
                      className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-white text-xs font-medium">
                        {
                          review.reviewer
                        }
                      </td>

                      <td className="px-4 py-3 text-green-300 text-xs max-w-[140px] truncate">
                        {
                          review.product
                        }
                      </td>

                      <td className="px-4 py-3">
                        <StarRating
                          rating={
                            review.rating
                          }
                        />
                      </td>

                      <td className="px-4 py-3 text-green-300 text-xs max-w-[200px] truncate">
                        {
                          review.comment
                        }
                      </td>

                      <td className="px-4 py-3 text-green-500 text-xs">
                        {
                          review.date
                        }
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={
                            review.status
                          }
                        />
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            flagReview(
                              review.id
                            )
                          }
                          disabled={
                            review.status ===
                            "Flagged"
                          }
                          className="p-1.5 rounded-lg bg-orange-900/50 hover:bg-orange-800 text-orange-400 hover:text-white disabled:opacity-40 transition-colors"
                          title="Flag review"
                        >
                          <Flag
                            size={13}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-green-800 flex items-center justify-between">
          <p className="text-green-500 text-xs">
            {filtered.length}{" "}
            review
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
    </div>
  );
}