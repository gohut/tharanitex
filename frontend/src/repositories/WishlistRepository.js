import { getDB } from "../database/db";

export class WishlistRepository {
  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT w.id as wishlist_item_id, w.product_id, w.created_at,
              p.name, p.price, p.image_url, p.fabric, p.color, p.stock
       FROM Wishlist_Items w
       JOIN Products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`
    )
    .bind(userId)
    .all();
    return results;
  }

  static async findItem(userId, productId) {
    const db = getDB();
    return await db.prepare(
      "SELECT * FROM Wishlist_Items WHERE user_id = ? AND product_id = ?"
    )
    .bind(userId, productId)
    .first();
  }

  static async create(userId, productId) {
    const db = getDB();
    const id = "wsh_" + crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Wishlist_Items (id, user_id, product_id, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(id, userId, productId, now)
    .run();

    return { id, user_id: userId, product_id: productId, created_at: now };
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Wishlist_Items WHERE id = ?").bind(id).run();
    return true;
  }

  static async deleteByProductAndUser(userId, productId) {
    const db = getDB();
    await db.prepare("DELETE FROM Wishlist_Items WHERE user_id = ? AND product_id = ?")
      .bind(userId, productId)
      .run();
    return true;
  }
}
