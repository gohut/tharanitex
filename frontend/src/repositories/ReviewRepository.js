import { getDB } from "../database/db";

export class ReviewRepository {
  static async findByProductId(productId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT r.*, u.name as user_name
       FROM Reviews r
       JOIN Users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`
    )
    .bind(productId)
    .all();
    return results;
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT r.*, u.name as user_name, p.name as product_name
       FROM Reviews r
       JOIN Users u ON r.user_id = u.id
       JOIN Products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    ).all();
    return results;
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Reviews WHERE id = ?").bind(id).first();
  }

  static async create({ id, user_id, product_id, rating, comment, status }) {
    const db = getDB();
    const now = new Date().toISOString();
    const reviewId = id || "rev_" + crypto.randomUUID();
    const initialStatus = status || "pending";

    await db.prepare(
      "INSERT INTO Reviews (id, user_id, product_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(reviewId, user_id, product_id, rating, comment || null, initialStatus, now)
    .run();

    return { id: reviewId, user_id, product_id, rating, comment, status: initialStatus, created_at: now };
  }

  static async updateStatus(id, status) {
    const db = getDB();
    await db.prepare("UPDATE Reviews SET status = ? WHERE id = ?").bind(status, id).run();
    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Reviews WHERE id = ?").bind(id).run();
    return true;
  }
}
