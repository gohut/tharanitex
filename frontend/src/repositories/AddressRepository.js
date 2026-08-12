import { getDB } from "../database/db";

export class AddressRepository {
  static async findByUserId(userId) {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC"
    )
    .bind(userId)
    .all();
    return results;
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Addresses WHERE id = ?").bind(id).first();
  }

  static async findDefaultByUserId(userId) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Addresses WHERE user_id = ? AND is_default = 1").bind(userId).first();
  }

  static async create({ user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default }) {
    const db = getDB();
    const id = "adr_" + crypto.randomUUID();
    const now = new Date().toISOString();
    const isDefaultInt = is_default ? 1 : 0;

    await db.prepare(
      `INSERT INTO Addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, user_id, full_name, phone, address_line1, address_line2 || null, city, state, pincode, isDefaultInt, now)
    .run();

    return { id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at: now };
  }

  static async update(id, { full_name, phone, address_line1, address_line2, city, state, pincode, is_default }) {
    const db = getDB();
    const isDefaultInt = is_default ? 1 : 0;

    await db.prepare(
      `UPDATE Addresses SET full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, is_default = ?
       WHERE id = ?`
    )
    .bind(full_name, phone, address_line1, address_line2 || null, city, state, pincode, isDefaultInt, id)
    .run();

    return this.findById(id);
  }

  static async clearDefault(userId) {
    const db = getDB();
    await db.prepare("UPDATE Addresses SET is_default = 0 WHERE user_id = ?").bind(userId).run();
    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Addresses WHERE id = ?").bind(id).run();
    return true;
  }
}
