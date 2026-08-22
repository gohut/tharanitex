import { getDB } from "../database/db";

function resolveDB(db) {
  return db || getDB();
}

export class ReviewRepository {
  static async findByProductId(
    productId,
    db
  ) {
    const database = resolveDB(db);

    const { results } = await database
      .prepare(`
        SELECT
          id,
          reviewer_name,
          customer_id,
          user_id,
          product_id,
          product_name,
          rating,
          comment,
          review_text,
          status,
          created_at,
          updated_at
        FROM reviews
        WHERE product_id = ?
          AND LOWER(status) = 'approved'
        ORDER BY created_at DESC
      `)
      .bind(productId)
      .all();

    return results || [];
  }

  static async findAll() {
    const db = getDB();

    const { results } = await db
      .prepare(`
        SELECT
          id,
          reviewer_name,
          customer_id,
          user_id,
          product_id,
          product_name,
          rating,
          comment,
          review_text,
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

    return results || [];
  }

  static async findById(id) {
    const db = getDB();

    return await db
      .prepare(`
        SELECT *
        FROM reviews
        WHERE id = ?
      `)
      .bind(id)
      .first();
  }

  static async create({
    id,
    reviewer_name,
    customer_id,
    user_id,
    product_id,
    product_name,
    rating,
    comment,
    status,
  }) {
    const db = getDB();

    const now =
      new Date().toISOString();

    const reviewId =
      id || null;

    const initialStatus =
      status || "Pending";

    const result = await db
      .prepare(`
        INSERT INTO reviews (
          id,
          reviewer_name,
          customer_id,
          user_id,
          product_id,
          product_name,
          rating,
          comment,
          review_text,
          status,
          created_at,
          updated_at
        )
        VALUES (
          COALESCE(?, NULL),
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
        reviewId,
        reviewer_name ||
          "Verified Customer",
        customer_id || null,
        user_id || null,
        product_id,
        product_name ||
          `Product #${product_id}`,
        rating,
        comment || "",
        comment || "",
        initialStatus,
        now,
        now
      )
      .run();

    return {
      id:
        result.meta?.last_row_id ??
        reviewId,

      reviewer_name:
        reviewer_name ||
        "Verified Customer",

      customer_id:
        customer_id || null,

      user_id:
        user_id || null,

      product_id,

      product_name:
        product_name ||
        `Product #${product_id}`,

      rating,

      comment:
        comment || "",

      review_text:
        comment || "",

      status:
        initialStatus,

      created_at: now,

      updated_at: now,
    };
  }

  static async updateStatus(
    id,
    status
  ) {
    const db = getDB();

    await db
      .prepare(`
        UPDATE reviews
        SET
          status = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        status,
        new Date().toISOString(),
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