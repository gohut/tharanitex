import { ReviewRepository } from "../repositories/ReviewRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { getDB } from "../database/db";

export class ReviewService {
  static async getProductReviews(productId) {
    return await ReviewRepository.findByProductId(
      productId
    );
  }

  static async getAllReviews() {
    return await ReviewRepository.findAll();
  }

  static async addReview(
    userId,
    {
      product_id,
      order_id,
      rating,
      comment,
    }
  ) {
    const db = getDB();

    const normalizedUserId = String(userId);
    const productId = Number(product_id);
    const orderId = Number(order_id);
    const numericRating = Number(rating);
    const reviewComment =
      String(comment || "").trim();

    if (
      !productId ||
      productId <= 0
    ) {
      throw new Error(
        "Invalid product."
      );
    }

    if (
      !orderId ||
      orderId <= 0
    ) {
      throw new Error(
        "A valid delivered order is required to review this product."
      );
    }

    if (
      !Number.isInteger(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5."
      );
    }

    if (!reviewComment) {
      throw new Error(
        "Review comment is required."
      );
    }

    if (reviewComment.length < 3) {
      throw new Error(
        "Review comment must be at least 3 characters."
      );
    }

    /*
     * Verify that the order belongs to the
     * logged-in customer AND is delivered.
     */
    const deliveredOrder =
      await db
        .prepare(`
          SELECT
            o.id,
            o.user_id,
            o.order_status,
            o.delivered_at
          FROM orders o
          WHERE o.id = ?
            AND o.user_id = ?
            AND LOWER(o.order_status) = 'delivered'
          LIMIT 1
        `)
        .bind(
          orderId,
          normalizedUserId
        )
        .first();

    if (!deliveredOrder) {
      throw new Error(
        "You can review a product only after your order has been delivered."
      );
    }

    /*
     * Verify that the requested product is
     * actually part of that delivered order.
     */
    const purchasedItem =
      await db
        .prepare(`
          SELECT
            oi.id,
            oi.order_id,
            oi.product_id
          FROM order_items oi
          WHERE oi.order_id = ?
            AND oi.product_id = ?
          LIMIT 1
        `)
        .bind(
          orderId,
          productId
        )
        .first();

    if (!purchasedItem) {
      throw new Error(
        "You can only review products included in your delivered order."
      );
    }

    /*
     * One review per user per product.
     *
     * This prevents a customer from reviewing
     * the same product repeatedly from multiple orders.
     */
    const existingReview =
      await db
        .prepare(`
          SELECT id
          FROM reviews
          WHERE user_id = ?
            AND product_id = ?
          LIMIT 1
        `)
        .bind(
          normalizedUserId,
          productId
        )
        .first();

    if (existingReview) {
      throw new Error(
        "You have already reviewed this product."
      );
    }

    const product =
      await ProductRepository.findById(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found."
      );
    }

    /*
     * Review remains pending until admin approval.
     */
    const review =
      await ReviewRepository.create({
        user_id: normalizedUserId,
        customer_id: null,
        product_id: productId,
        product_name:
          product.name ||
          `Product #${productId}`,
        rating: numericRating,
        comment: reviewComment,
        status: "Pending",
        reviewer_name:
          "Verified Customer",
      });

    return review;
  }

  static async approveReview(
    reviewId
  ) {
    const review =
      await ReviewRepository.findById(
        reviewId
      );

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    return await ReviewRepository.updateStatus(
      reviewId,
      "Approved"
    );
  }

  static async deleteReview(
    reviewId
  ) {
    const review =
      await ReviewRepository.findById(
        reviewId
      );

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    return await ReviewRepository.delete(
      reviewId
    );
  }
}