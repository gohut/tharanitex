import { ReviewRepository } from "../repositories/ReviewRepository";
import { getDB } from "../database/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function createError(
  message,
  status = 400
) {
  const error =
    new Error(message);

  error.status = status;

  return error;
}

function getExtension(type) {
  if (type === "image/jpeg") {
    return "jpg";
  }

  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return null;
}

async function validateImageSignature(
  file
) {
  const buffer =
    await file.arrayBuffer();

  const bytes =
    new Uint8Array(buffer);

  if (file.type === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (file.type === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/webp") {
    if (bytes.length < 12) {
      return false;
    }

    const riff =
      String.fromCharCode(
        bytes[0],
        bytes[1],
        bytes[2],
        bytes[3]
      );

    const webp =
      String.fromCharCode(
        bytes[8],
        bytes[9],
        bytes[10],
        bytes[11]
      );

    return (
      riff === "RIFF" &&
      webp === "WEBP"
    );
  }

  return false;
}

async function getBucket() {
  const { env } =
    await getCloudflareContext({
      async: true,
    });

  const bucket =
    env?.PRODUCT_IMAGES ||
    env?.tharani_product_images;

  if (!bucket) {
    throw createError(
      "Review image storage is not configured.",
      500
    );
  }

  return bucket;
}

async function deleteImages(
  bucket,
  keys
) {
  if (
    !bucket ||
    !Array.isArray(keys)
  ) {
    return;
  }

  for (const key of keys) {
    if (!key) {
      continue;
    }

    try {
      await bucket.delete(key);
    } catch (error) {
      console.error(
        "Failed to delete review image:",
        key,
        error
      );
    }
  }
}

export class ReviewService {
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

    const userIdNumber =
      Number(userId);

    const productId =
      Number(product_id);

    const orderId =
      Number(order_id);

    const numericRating =
      Number(rating);

    const reviewComment =
      String(
        comment || ""
      ).trim();

    if (
      !Number.isInteger(
        userIdNumber
      ) ||
      userIdNumber <= 0
    ) {
      throw createError(
        "Invalid authenticated user.",
        401
      );
    }

    if (
      !Number.isInteger(
        productId
      ) ||
      productId <= 0
    ) {
      throw createError(
        "Invalid product."
      );
    }

    if (
      !Number.isInteger(
        orderId
      ) ||
      orderId <= 0
    ) {
      throw createError(
        "Invalid order."
      );
    }

    if (
      !Number.isInteger(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw createError(
        "Rating must be between 1 and 5."
      );
    }

    if (
      reviewComment.length < 3
    ) {
      throw createError(
        "Review comment must be at least 3 characters long."
      );
    }

    /*
     * 1. Verify that this order belongs
     *    to the authenticated user.
     */
    const order =
      await db
        .prepare(`
          SELECT
            id,
            user_id,
            order_status
          FROM orders
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `)
        .bind(
          orderId,
          userIdNumber
        )
        .first();

    if (!order) {
      throw createError(
        "You can only review products from your own orders.",
        403
      );
    }

    /*
     * 2. Order MUST be delivered.
     */
    if (
      String(
        order.order_status ||
          ""
      ).toLowerCase() !==
      "delivered"
    ) {
      throw createError(
        "You can review a product only after it has been delivered."
      );
    }

    /*
     * 3. Verify the product exists
     *    inside that exact order.
     */
    const orderItem =
      await db
        .prepare(`
          SELECT
            id,
            order_id,
            product_id,
            quantity,
            price
          FROM order_items
          WHERE order_id = ?
            AND product_id = ?
          LIMIT 1
        `)
        .bind(
          orderId,
          productId
        )
        .first();

    if (!orderItem) {
      throw createError(
        "This product was not purchased in the selected order.",
        403
      );
    }

    /*
     * 4. Prevent duplicate reviews.
     *
     * The same customer cannot review the
     * same product twice.
     */
    const existingReview =
      await db
        .prepare(`
          SELECT id
          FROM reviews
          WHERE user_id = ?
            AND product_id = ?
            AND order_id = ?
          LIMIT 1
        `)
        .bind(
          userIdNumber,
          productId,
          orderId
        )
        .first();

    if (existingReview) {
      throw createError(
        "You have already reviewed this product from this order."
      );
    }

    /*
     * 5. Get the actual product.
     */
    const product =
      await db
        .prepare(`
          SELECT
            id,
            name,
            is_active
          FROM products
          WHERE id = ?
          LIMIT 1
        `)
        .bind(productId)
        .first();

    if (!product) {
      throw createError(
        "Product not found.",
        404
      );
    }

    /*
     * 6. Get the authenticated user's
     *    real name from D1.
     */
    const user =
      await db
        .prepare(`
          SELECT
            id,
            first_name,
            last_name
          FROM users
          WHERE id = ?
          LIMIT 1
        `)
        .bind(userIdNumber)
        .first();

    const reviewerName =
      [
        user?.first_name,
        user?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Verified Customer";

    /*
     * 7. Validate images.
     */
    const files =
      Array.isArray(
        imageFiles
      )
        ? imageFiles
        : [];

    if (
      files.length >
      MAX_IMAGES
    ) {
      throw createError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        throw createError(
          "Invalid review image."
        );
      }

      if (
        !ALLOWED_IMAGE_TYPES.has(
          file.type
        )
      ) {
        throw createError(
          "Only JPG, PNG and WEBP images are allowed."
        );
      }

      if (
        file.size <= 0
      ) {
        throw createError(
          "One of the uploaded images is empty."
        );
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        throw createError(
          "Each review image must be 5 MB or smaller."
        );
      }

      const validSignature =
        await validateImageSignature(
          file
        );

      if (!validSignature) {
        throw createError(
          "One of the uploaded files is not a valid image."
        );
      }
    }

    let bucket = null;
    const uploadedKeys = [];

    try {
      /*
       * 8. Upload review images to R2.
       */
      if (files.length > 0) {
        bucket =
          await getBucket();

        for (
          let i = 0;
          i < files.length;
          i++
        ) {
          const file =
            files[i];

          const extension =
            getExtension(
              file.type
            );

          const key =
            `reviews/${userIdNumber}/${productId}/${crypto.randomUUID()}-${i}.${extension}`;

          await bucket.put(
            key,
            await file.arrayBuffer(),
            {
              httpMetadata: {
                contentType:
                  file.type,
              },
            }
          );

          uploadedKeys.push(
            key
          );
        }
      }

      /*
       * 9. Create the review.
       *
       * IMPORTANT:
       * It is immediately Approved because
       * all purchase checks happened above.
       */
      const review =
        await ReviewRepository.create({
          reviewer_name:
            reviewerName,

          customer_id:
            userIdNumber,

          user_id:
            userIdNumber,

          product_id:
            productId,

          product_name:
            product.name,

          order_id:
            orderId,

          rating:
            numericRating,

          comment:
            reviewComment,

          status:
            "Approved",

          image_keys:
            uploadedKeys,
        });

      return review;
    } catch (error) {
      /*
       * Database insertion failed after R2 upload.
       * Clean up uploaded files.
       */
      await deleteImages(
        bucket,
        uploadedKeys
      );

      throw error;
    }
  }

  static async getProductReviews(
    productId
  ) {
    return await ReviewRepository.findByProductId(
      productId
    );
  }

  static async getAllReviews() {
    return await ReviewRepository.findAll();
  }

  static async flagReview(
    reviewId,
    reason,
    adminId
  ) {
    const review =
      await ReviewRepository.findById(
        reviewId
      );

    if (!review) {
      throw createError(
        "Review not found.",
        404
      );
    }

    await ReviewRepository.flag(
      reviewId,
      reason,
      adminId
    );

    return true;
  }

  static async deleteReview(
    reviewId
  ) {
    const review =
      await ReviewRepository.findById(
        reviewId
      );

    if (!review) {
      throw createError(
        "Review not found.",
        404
      );
    }

    let bucket = null;

    if (
      review.image_keys?.length
    ) {
      bucket =
        await getBucket();
    }

    await ReviewRepository.delete(
      reviewId
    );

    await deleteImages(
      bucket,
      review.image_keys
    );

    return true;
  }
}