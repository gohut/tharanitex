import { ReviewRepository } from "../repositories/ReviewRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { getDB } from "../database/db";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getImageExtension(file) {
  const type = String(file.type || "").toLowerCase();

  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";

  return "jpg";
}

async function uploadReviewImages(files) {
  if (!files || files.length === 0) {
    return [];
  }

  if (files.length > MAX_IMAGES) {
    throw new Error(
      `You can upload a maximum of ${MAX_IMAGES} images.`
    );
  }

  const bucket =
    process.env.BUCKET;

  if (!bucket) {
    throw new Error(
      "R2 storage bucket binding not found."
    );
  }

  const uploadedKeys = [];

  try {
    for (const file of files) {
      if (!(file instanceof File)) {
        throw new Error("Invalid review image.");
      }

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error(
          "Only JPG, PNG and WEBP images are allowed."
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error(
          "Each review image must be 5 MB or smaller."
        );
      }

      const extension =
        getImageExtension(file);

      const key =
        `reviews/${crypto.randomUUID()}.${extension}`;

      const bytes =
        await file.arrayBuffer();

      await bucket.put(
        key,
        bytes,
        {
          httpMetadata: {
            contentType: file.type,
          },
        }
      );

      uploadedKeys.push(key);
    }

    return uploadedKeys;
  } catch (error) {
    // Clean up anything already uploaded
    for (const key of uploadedKeys) {
      try {
        await bucket.delete(key);
      } catch {}
    }

    throw error;
  }
}

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
      imageFiles = [],
    }
  ) {
    const db = getDB();

    const normalizedUserId =
      String(userId);

    const productId =
      Number(product_id);

    const orderId =
      Number(order_id);

    const numericRating =
      Number(rating);

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
     * Verify delivered order.
     *
     * IMPORTANT:
     * Do not query delivered_at because
     * your current order schema does not
     * consistently contain that field.
     */
    const deliveredOrder =
      await db
        .prepare(`
          SELECT
            o.id,
            o.user_id,
            o.order_status
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
     * Verify the product belongs
     * to that delivered order.
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
     * Upload images only after all
     * validation has passed.
     */
    const imageKeys =
      await uploadReviewImages(
        imageFiles
      );

    try {
      const review =
        await ReviewRepository.create({
          user_id:
            normalizedUserId,

          customer_id: null,

          product_id:
            productId,

          product_name:
            product.name ||
            `Product #${productId}`,

          rating:
            numericRating,

          comment:
            reviewComment,

          status:
            "Pending",

          reviewer_name:
            "Verified Customer",

          image_keys:
            imageKeys,
        });

      return review;
    } catch (error) {
      /*
       * If DB insertion fails,
       * remove uploaded images.
       */
      const bucket =
        process.env.BUCKET;

      if (bucket) {
        for (const key of imageKeys) {
          try {
            await bucket.delete(key);
          } catch {}
        }
      }

      throw error;
    }
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