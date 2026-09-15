import { getDB } from "../database/db";

export class CartRepository {
  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT c.id as cart_item_id, c.product_id, c.variant_id, c.quantity, c.created_at,
              p.name, p.price, p.material, p.color, p.stock,
              v.name as variant_name, v.price as variant_price, v.stock as variant_stock,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_variants v ON c.variant_id = v.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`
    )
    .bind(String(userId))
    .all();
    return results || [];
  }

  static async findItem(userId, productId, variantId = null) {
    const db = getDB();
    if (variantId) {
      return await db.prepare(
        "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND variant_id = ?"
      )
      .bind(String(userId), productId, variantId)
      .first();
    }
    return await db.prepare(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND variant_id IS NULL"
    )
    .bind(String(userId), productId)
    .first();
  }

  static async create(userId, productId, quantity, variantId = null) {
    const db = getDB();
    const now = new Date().toISOString();
    const result = await db.prepare(
      "INSERT INTO cart_items (user_id, product_id, variant_id, quantity, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(String(userId), productId, variantId || null, quantity, now)
    .run();

    return { id: result.meta?.last_row_id, user_id: userId, product_id: productId, variant_id: variantId, quantity, created_at: now };
  }

  static async updateQuantity(id, quantity) {
    const db = getDB();
    await db.prepare(
      "UPDATE cart_items SET quantity = ? WHERE id = ?"
    )
    .bind(quantity, id)
    .run();

    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM cart_items WHERE id = ?").bind(id).run();
    return true;
  }

  static async deleteByUserId(userId) {
    const db = getDB();
    await db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(String(userId)).run();
    return true;
  }
}
