import { getDB } from "../database/db";

export class OrderRepository {
  static async findById(id) {
    const db = getDB();
    const order = await db.prepare(
      `SELECT o.*, o.order_status as status,
              u.first_name || CASE WHEN u.last_name IS NOT NULL AND u.last_name != '' THEN ' ' || u.last_name ELSE '' END as customer_name,
              u.email as customer_email, u.phone as customer_phone,
              a.full_name as shipping_name, a.phone as shipping_phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ?`
    )
    .bind(id)
    .first();

    if (!order) return null;

    const items = await this.findItemsByOrderId(id);
    const payment = await db.prepare("SELECT * FROM payments WHERE order_id = ?").bind(id).first().catch(() => null);

    return { ...order, items, payment };
  }

  static async findItemsByOrderId(orderId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT oi.*, oi.price as unit_price, (oi.price * oi.quantity) as total_price,
              p.name as product_name,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`
    )
    .bind(orderId)
    .all();
    return results || [];
  }

  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT *, order_status as status FROM orders WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all();
    return results || [];
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT o.*, o.order_status as status,
              u.first_name || CASE WHEN u.last_name IS NOT NULL AND u.last_name != '' THEN ' ' || u.last_name ELSE '' END as customer_name,
              u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    ).all();
    return results || [];
  }

  static async create({ id, user_id, address_id, status, total_amount }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO orders (id, user_id, address_id, order_status, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, user_id, address_id, status || "placed", total_amount, now, now)
    .run();

    return { id, user_id, address_id, status: status || "placed", total_amount, created_at: now, updated_at: now };
  }

  static async createItem({ id, order_id, product_id, quantity, unit_price, total_price }) {
    const db = getDB();
    await db.prepare(
      "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(id, order_id, product_id, quantity, unit_price)
    .run();

    return { id, order_id, product_id, quantity, unit_price, total_price };
  }

  static async updateStatus(id, status) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?"
    )
    .bind(status, now, id)
    .run();

    return true;
  }

  static async countAll() {
    const db = getDB();
    const result = await db.prepare("SELECT COUNT(*) as count FROM orders").first();
    return result ? result.count : 0;
  }

  static async sumRevenue() {
    const db = getDB();
    // Sum revenue excluding cancelled orders
    try {
      const result = await db.prepare(
        "SELECT SUM(total_amount) as total FROM orders WHERE LOWER(order_status) != 'cancelled' AND (cancellation_status IS NULL OR LOWER(cancellation_status) != 'approved')"
      ).first();
      return result && result.total ? result.total : 0;
    } catch {
      const fallback = await db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE LOWER(order_status) != 'cancelled'").first();
      return fallback && fallback.total ? fallback.total : 0;
    }
  }

  static async findRecent(limit = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT o.*, o.order_status as status,
              u.first_name || CASE WHEN u.last_name IS NOT NULL AND u.last_name != '' THEN ' ' || u.last_name ELSE '' END as customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
    return results || [];
  }

  static async findTopProducts(limit = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT p.id, p.name, p.price,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE LOWER(o.order_status) != 'cancelled'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
    return results || [];
  }
}
