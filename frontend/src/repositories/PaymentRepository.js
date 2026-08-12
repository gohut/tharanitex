import { getDB } from "../database/db";

export class PaymentRepository {
  static async findByOrderId(orderId) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Payments WHERE order_id = ?").bind(orderId).first();
  }

  static async findByTransactionId(transactionId) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Payments WHERE transaction_id = ?").bind(transactionId).first();
  }

  static async create({ order_id, amount, method, status, transaction_id }) {
    const db = getDB();
    const id = "pay_" + crypto.randomUUID();
    const now = new Date().toISOString();
    const paidAt = status === "completed" ? now : null;

    await db.prepare(
      `INSERT INTO Payments (id, order_id, amount, method, status, transaction_id, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, order_id, amount, method, status || "pending", transaction_id || null, paidAt)
    .run();

    return { id, order_id, amount, method, status, transaction_id, paid_at: paidAt };
  }

  static async updateStatus(orderId, status, transactionId) {
    const db = getDB();
    const now = new Date().toISOString();
    const paidAt = status === "completed" ? now : null;

    await db.prepare(
      `UPDATE Payments SET status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = COALESCE(?, paid_at)
       WHERE order_id = ?`
    )
    .bind(status, transactionId || null, paidAt, orderId)
    .run();

    return true;
  }
}
