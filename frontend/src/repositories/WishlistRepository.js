import { getDB } from "../database/db";

export class WishlistRepository {
  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT w.id as wishlist_item_id, w.product_id, w.created_at,
              p.name, p.price, p.material, p.color, p.stock,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`
    )
    .bind(String(userId))
    .all();
    return results || [];
  }

  static async findItem(userId, productId) {
    const db = getDB();
    return await db.prepare(
      "SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ?"
    )
    .bind(String(userId), productId)
    .first();
  }

  static async create(userId, productId) {
    const db = getDB();
    const now = new Date().toISOString();
    const result = await db.prepare(
      "INSERT INTO wishlist_items (user_id, product_id, created_at) VALUES (?, ?, ?)"
    )
    .bind(String(userId), productId, now)
    .run();

    return { id: result.meta?.last_row_id, user_id: userId, product_id: productId, created_at: now };
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM wishlist_items WHERE id = ?").bind(id).run();
    return true;
  }

  static async deleteByProductAndUser(userId, productId) {
    const db = getDB();
    await db.prepare("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?")
      .bind(String(userId), productId)
      .run();
    return true;
  }
}
