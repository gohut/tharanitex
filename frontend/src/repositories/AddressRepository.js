import { getDB } from "../database/db";

export class AddressRepository {
  static async findByUserId(userId, env) {
    const db = getDB(env);
    const { results } = await db.prepare(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC"
    )
    .bind(userId)
    .all();
    return results || [];
  }

  static async findById(id, env) {
    const db = getDB(env);
    return await db.prepare("SELECT * FROM addresses WHERE id = ?").bind(id).first();
  }

  static async findDefaultByUserId(userId, env) {
    const db = getDB(env);
    return await db.prepare("SELECT * FROM addresses WHERE user_id = ? AND is_default = 1").bind(userId).first();
  }

  static async create({ user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default }, env) {
    const db = getDB(env);
    const isDefaultInt = is_default ? 1 : 0;

    const result = await db.prepare(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(user_id, full_name, phone, address_line1, address_line2 || null, city, state, pincode, isDefaultInt)
    .run();

    const insertId = result?.meta?.last_row_id;
    if (insertId) {
      return this.findById(insertId, env);
    }

    return { user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default };
  }

  static async update(id, { full_name, phone, address_line1, address_line2, city, state, pincode, is_default }, env) {
    const db = getDB(env);
    const isDefaultInt = is_default ? 1 : 0;

    await db.prepare(
      `UPDATE addresses SET full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, is_default = ?
       WHERE id = ?`
    )
    .bind(full_name, phone, address_line1, address_line2 || null, city, state, pincode, isDefaultInt, id)
    .run();

    return this.findById(id, env);
  }

  static async clearDefault(userId, env) {
    const db = getDB(env);
    await db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").bind(userId).run();
    return true;
  }

  static async delete(id, env) {
    const db = getDB(env);
    await db.prepare("DELETE FROM addresses WHERE id = ?").bind(id).run();
    return true;
  }
}
