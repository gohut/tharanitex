import { getDB } from "../database/db";

function resolveDB(db) {
  return db || getDB();
}

function parseImageKeys(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export class ReviewRepository {
  static async findByProductId(
    productId,
    db
  ) {
    const database = resolveDB(db);

    const { results } =
      await database
        .prepare(`
          SELECT
            id,
            reviewer_name,
            customer_id,
            user_id,
            product_id,
            product_name,
            order_id,
            rating,
            comment,
            review_text,
            image_keys,
            status,
            flagged_reason,
            reviewed_by,
            reviewed_at,
            created_at,
            updated_at
          FROM reviews
          WHERE product_id = ?
            AND LOWER(status) = 'approved'
          ORDER BY created_at DESC
        `)
        .bind(productId)
        .all();

    return (results || []).map(
      (review) => ({
        ...review,
        image_keys:
          parseImageKeys(
            review.image_keys
          ),
      })
    );
  }

  static async findAll() {
    const db = getDB();

    const { results } =
      await db
        .prepare(`
          SELECT
            id,
            reviewer_name,
            customer_id,
            user_id,
            product_id,
            product_name,
            order_id,
            rating,
            comment,
            review_text,
            image_keys,
            status,
            flagged_reason,
            reviewed_by,
            reviewed_at,
            created_at,
            updated_at
          FROM reviews
          ORDER BY created_at DESC
        `)
        .all();

    return (results || []).map(
      (review) => ({
        ...review,
        image_keys:
          parseImageKeys(
            review.image_keys
          ),
      })
    );
  }

  static async findById(id) {
    const db = getDB();

    const review =
      await db
        .prepare(`
          SELECT *
          FROM reviews
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first();

    if (!review) {
      return null;
    }

    return {
      ...review,
      image_keys:
        parseImageKeys(
          review.image_keys
        ),
    };
  }

  static async create({
    reviewer_name,
    customer_id,
    user_id,
    product_id,
    product_name,
    order_id,
    rating,
    comment,
    status = "Approved",
    image_keys = [],
  }) {
    const db = getDB();

    const now =
      new Date().toISOString();

    const normalizedImages =
      Array.isArray(image_keys)
        ? image_keys
        : [];

    const result =
      await db
        .prepare(`
          INSERT INTO reviews (
            reviewer_name,
            customer_id,
            user_id,
            product_id,
            product_name,
            order_id,
            rating,
            comment,
            review_text,
            image_keys,
            status,
            created_at,
            updated_at
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `)
        .bind(
          reviewer_name ||
            "Verified Customer",

          customer_id ?? null,

          user_id ?? null,

          product_id,

          product_name ||
            `Product #${product_id}`,

          order_id,

          rating,

          comment || "",

          comment || "",

          JSON.stringify(
            normalizedImages
          ),

          /*
           * Reviews are automatically published
           * after backend purchase verification.
           */
          status,

          now,

          now
        )
        .run();

    return {
      id:
        result.meta?.last_row_id,

      reviewer_name:
        reviewer_name ||
        "Verified Customer",

      customer_id:
        customer_id ?? null,

      user_id:
        user_id ?? null,

      product_id,

      product_name:
        product_name ||
        `Product #${product_id}`,

      order_id,

      rating,

      comment:
        comment || "",

      review_text:
        comment || "",

      image_keys:
        normalizedImages,

      status,

      created_at: now,

      updated_at: now,
    };
  }

  static async flag(
    id,
    reason,
    adminId
  ) {
    const db = getDB();

    const now =
      new Date().toISOString();

    await db
      .prepare(`
        UPDATE reviews
        SET
          status = 'Flagged',
          flagged_reason = ?,
          reviewed_by = ?,
          reviewed_at = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        reason || null,
        adminId ?? null,
        now,
        now,
        id
      )
      .run();

    return true;
  }

  static async delete(id) {
    const db = getDB();

    await db
      .prepare(`
        DELETE FROM reviews
        WHERE id = ?
      `)
      .bind(id)
      .run();

    return true;
  }
}