import { getDB } from "../database/db";

export class CartRepository {
  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT c.id as cart_item_id, c.product_id, c.quantity, c.created_at, c.updated_at,
              p.name, p.price, p.image_url, p.fabric, p.color, p.stock
       FROM Cart_Items c
       JOIN Products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`
    )
    .bind(userId)
    .all();
    return results;
  }

  static async findItem(userId, productId) {
    const db = getDB();
    return await db.prepare(
      "SELECT * FROM Cart_Items WHERE user_id = ? AND product_id = ?"
    )
    .bind(userId, productId)
    .first();
  }

  static async create(userId, productId, quantity) {
    const db = getDB();
    const id = "crt_" + crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Cart_Items (id, user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, userId, productId, quantity, now, now)
    .run();

    return { id, user_id: userId, product_id: productId, quantity, created_at: now, updated_at: now };
  }

  static async updateQuantity(id, quantity) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE Cart_Items SET quantity = ?, updated_at = ? WHERE id = ?"
    )
    .bind(quantity, now, id)
    .run();

    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Cart_Items WHERE id = ?").bind(id).run();
    return true;
  }

  static async deleteByUserId(userId) {
    const db = getDB();
    await db.prepare("DELETE FROM Cart_Items WHERE user_id = ?").bind(userId).run();
    return true;
  }
}
