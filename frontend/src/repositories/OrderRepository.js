import { getDB } from "../database/db";

export class OrderRepository {
  static async findById(id) {
    const db = getDB();
    const order = await db.prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
              a.full_name as shipping_name, a.phone as shipping_phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode
       FROM Orders o
       JOIN Users u ON o.user_id = u.id
       JOIN Addresses a ON o.address_id = a.id
       WHERE o.id = ?`
    )
    .bind(id)
    .first();

    if (!order) return null;

    const items = await this.findItemsByOrderId(id);
    const payment = await db.prepare("SELECT * FROM Payments WHERE order_id = ?").bind(id).first();

    return { ...order, items, payment };
  }

  static async findItemsByOrderId(orderId) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT oi.*, p.name as product_name, p.image_url
       FROM Order_Items oi
       JOIN Products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`
    )
    .bind(orderId)
    .all();
    return results;
  }

  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all();
    return results;
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM Orders o
       JOIN Users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    ).all();
    return results;
  }

  static async create({ id, user_id, address_id, status, total_amount }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Orders (id, user_id, address_id, status, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, user_id, address_id, status || "pending", total_amount, now, now)
    .run();

    return { id, user_id, address_id, status, total_amount, created_at: now, updated_at: now };
  }

  static async createItem({ id, order_id, product_id, quantity, unit_price, total_price }) {
    const db = getDB();
    await db.prepare(
      "INSERT INTO Order_Items (id, order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, order_id, product_id, quantity, unit_price, total_price)
    .run();

    return { id, order_id, product_id, quantity, unit_price, total_price };
  }

  static async updateStatus(id, status) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE Orders SET status = ?, updated_at = ? WHERE id = ?"
    )
    .bind(status, now, id)
    .run();

    return true;
  }

  static async countAll() {
    const db = getDB();
    const result = await db.prepare("SELECT COUNT(*) as count FROM Orders").first();
    return result ? result.count : 0;
  }

  static async sumRevenue() {
    const db = getDB();
    // Sum revenue excluding cancelled orders
    const result = await db.prepare(
      "SELECT SUM(total_amount) as total FROM Orders WHERE status != 'cancelled'"
    ).first();
    return result && result.total ? result.total : 0;
  }

  static async findRecent(limit = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT o.*, u.name as customer_name
       FROM Orders o
       JOIN Users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
    return results;
  }

  static async findTopProducts(limit = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT p.id, p.name, p.price, p.image_url, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
       FROM Order_Items oi
       JOIN Products p ON oi.product_id = p.id
       JOIN Orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
    return results;
  }
}
