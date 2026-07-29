"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewSection({ reviews }) {
  const [visibleReviews, setVisibleReviews] = useState(3);

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((review) => review.rating === rating).length
  );

  return (
    <section className="mt-32 mb-32">

      <div className="mb-16">

        <p className="uppercase tracking-[3px] text-[#C39A32] text-sm">
          Customer Feedback
        </p>

        <h2 className="mt-3 font-serif text-5xl uppercase text-[#C48B2A]">
          Reviews & Ratings
        </h2>

      </div>

      <div className="grid gap-20 lg:grid-cols-[350px_1fr]">

        {/* Left */}

        <div>

          <h3 className="text-[70px] font-light text-[#C48B2A] leading-none">
            {average.toFixed(1)}
          </h3>

          <div className="mt-4 flex gap-1">

            {[1,2,3,4,5].map((star) => (

              <Star
                key={star}
                size={22}
                fill={
                  star <= Math.round(average)
                    ? "#F3A900"
                    : "transparent"
                }
                color="#F3A900"
              />

            ))}

          </div>

          <p className="mt-3 text-gray-500">
            Based on {reviews.length} reviews
          </p>

          <div className="mt-10 space-y-5">

            {[5,4,3,2,1].map((rating, index) => {

              const count = ratingCounts[index];

              const width =
                reviews.length === 0
                  ? 0
                  : (count / reviews.length) * 100;

              return (

                <div
                  key={rating}
                  className="flex items-center gap-4"
                >

                  <span className="w-5 text-sm">

                    {rating}

                  </span>

                  <Star
                    size={14}
                    fill="#F3A900"
                    color="#F3A900"
                  />

                  <div className="h-2 flex-1 rounded-full bg-[#ECE7E0]">

                    <div
                      className="h-2 rounded-full bg-[#C48B2A]"
                      style={{
                        width: `${width}%`,
                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>

        {/* Right */}

        <div className="space-y-8">

          {reviews.slice(0, visibleReviews).map((review) => (

            <div
              key={review.id}
              className="border-b border-[#ECE7E0] pb-8"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h4 className="font-semibold text-lg">

                    {review.name}

                  </h4>

                  <p className="text-sm text-gray-400">

                    {review.date}

                  </p>

                </div>

                <div className="flex gap-1">

                  {[1,2,3,4,5].map((star) => (

                    <Star
                      key={star}
                      size={18}
                      fill={
                        star <= review.rating
                          ? "#F3A900"
                          : "transparent"
                      }
                      color="#F3A900"
                    />

                  ))}

                </div>

              </div>

              <p className="mt-5 leading-8 text-[#555]">

                {review.comment}

              </p>

            </div>

          ))}

          {visibleReviews < reviews.length && (

            <button
              onClick={() =>
                setVisibleReviews((prev) => prev + 3)
              }
              className="mt-8 h-14 px-10 border border-[#C48B2A] text-[#C48B2A] font-medium transition-all duration-300 hover:bg-[#C48B2A] hover:text-white"
            >

              Load More Reviews

            </button>

          )}

        </div>

      </div>

    </section>
  );
}