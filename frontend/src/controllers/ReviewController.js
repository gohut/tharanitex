import { ReviewService } from "../services/ReviewService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate, authenticateAdmin } from "../middleware/auth";

export class ReviewController {
  static async addProductReview(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      const valErrors = Validators.validateReview(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const review = await ReviewService.addReview(payload.id, body);
      return ApiResponse.success(review, "Review submitted and is pending moderation.", 201);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async adminGetReviews(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const reviews = await ReviewService.getAllReviews();
      return ApiResponse.success(reviews);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminApproveReview(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const reviewId = resolvedParams.id;

      await ReviewService.approveReview(reviewId);
      return ApiResponse.success(null, "Review approved successfully");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async adminDeleteReview(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const reviewId = resolvedParams.id;

      await ReviewService.deleteReview(reviewId);
      return ApiResponse.success(null, "Review deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}
