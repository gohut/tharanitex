import { ReviewRepository } from "../repositories/ReviewRepository";
import { ProductRepository } from "../repositories/ProductRepository";

export class ReviewService {
  static async getProductReviews(productId) {
    return await ReviewRepository.findByProductId(productId);
  }

  static async getAllReviews() {
    return await ReviewRepository.findAll();
  }

  static async addReview(userId, { product_id, rating, comment }) {
    const product = await ProductRepository.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Default reviews to 'approved' for immediate visibility, or 'pending' for review
    // Let's set it as 'pending' to match the "Reviews: Approve" admin requirement!
    return await ReviewRepository.create({
      user_id: userId,
      product_id,
      rating,
      comment,
      status: "pending",
    });
  }

  static async approveReview(reviewId) {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }
    return await ReviewRepository.updateStatus(reviewId, "approved");
  }

  static async deleteReview(reviewId) {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }
    return await ReviewRepository.delete(reviewId);
  }
}
