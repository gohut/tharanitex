import { ReviewService } from "../services/ReviewService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import {
  authenticate,
  authenticateAdmin,
} from "../middleware/auth";

export class ReviewController {
  static async addProductReview(request) {
    try {
      const payload =
        await authenticate(request);

      if (!payload) {
        return ApiResponse.unauthorized(
          "Authentication required"
        );
      }

      const contentType =
        request.headers.get(
          "content-type"
        ) || "";

      let body;
      let imageFiles = [];

      if (
        contentType.includes(
          "multipart/form-data"
        )
      ) {
        const formData =
          await request.formData();

        body = {
          product_id:
            formData.get(
              "product_id"
            ),
          order_id:
            formData.get(
              "order_id"
            ),
          rating:
            formData.get(
              "rating"
            ),
          comment:
            formData.get(
              "comment"
            ),
        };

        imageFiles =
          formData
            .getAll("images")
            .filter(
              (file) =>
                file instanceof File &&
                file.size > 0
            );
      } else {
        body =
          await request.json();
      }

      const valErrors =
        Validators.validateReview(
          body
        );

      if (valErrors) {
        return ApiResponse.badRequest(
          "Validation failed",
          valErrors
        );
      }

      const review =
        await ReviewService.addReview(
          payload.id,
          {
            ...body,
            imageFiles,
          }
        );

      return ApiResponse.success(
        review,
        "Review submitted successfully.",
        201
      );
    } catch (error) {
      console.error(
        "Review submission error:",
        error
      );

      return ApiResponse.error(
        error?.message ||
          "Unable to submit review.",
        error?.status || 500
      );
    }
  }

  static async adminGetReviews(
    request
  ) {
    try {
      if (
        !(await authenticateAdmin(
          request
        ))
      ) {
        return ApiResponse.forbidden(
          "Admin access required"
        );
      }

      const reviews =
        await ReviewService.getAllReviews();

      return ApiResponse.success(
        reviews
      );
    } catch (error) {
      console.error(
        "Admin review fetch error:",
        error
      );

      return ApiResponse.error(
        error?.message ||
          "Unable to load reviews.",
        error?.status || 500
      );
    }
  }

  static async adminDeleteReview(
    request,
    { params }
  ) {
    try {
      if (
        !(await authenticateAdmin(
          request
        ))
      ) {
        return ApiResponse.forbidden(
          "Admin access required"
        );
      }

      const resolvedParams =
        await params;

      const reviewId =
        Number(
          resolvedParams?.id
        );

      if (
        !Number.isInteger(
          reviewId
        ) ||
        reviewId <= 0
      ) {
        return ApiResponse.badRequest(
          "Invalid review ID."
        );
      }

      await ReviewService.deleteReview(
        reviewId
      );

      return ApiResponse.success(
        null,
        "Review deleted successfully."
      );
    } catch (error) {
      console.error(
        "Admin review deletion error:",
        error
      );

      return ApiResponse.error(
        error?.message ||
          "Unable to delete review.",
        error?.status || 500
      );
    }
  }
}