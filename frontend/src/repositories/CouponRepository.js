import { getDB } from "../database/db";

export class CouponRepository {
  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare("SELECT * FROM Coupons ORDER BY created_at DESC").all();
    return results;
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Coupons WHERE id = ?").bind(id).first();
  }

  static async findByCode(code) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Coupons WHERE code = ?").bind(code).first();
  }

  static async create({ code, discount_type, discount_value, min_purchase, expires_at, status }) {
    const db = getDB();
    const id = "cpn_" + crypto.randomUUID();
    const now = new Date().toISOString();
    const activeStatus = status || "active";

    await db.prepare(
      `INSERT INTO Coupons (id, code, discount_type, discount_value, min_purchase, expires_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, code.toUpperCase(), discount_type, discount_value, min_purchase || 0, expires_at, activeStatus, now)
    .run();

    return { id, code, discount_type, discount_value, min_purchase, expires_at, status: activeStatus, created_at: now };
  }

  static async update(id, { code, discount_type, discount_value, min_purchase, expires_at, status }) {
    const db = getDB();
    await db.prepare(
      `UPDATE Coupons SET code = ?, discount_type = ?, discount_value = ?, min_purchase = ?, expires_at = ?, status = ?
       WHERE id = ?`
    )
    .bind(code.toUpperCase(), discount_type, discount_value, min_purchase || 0, expires_at, status, id)
    .run();

    return { id, code, discount_type, discount_value, min_purchase, expires_at, status };
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Coupons WHERE id = ?").bind(id).run();
    return true;
  }
}
