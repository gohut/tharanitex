import { getDB } from "../database/db";

export class UserRepository {
  static async findByEmail(email) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Users WHERE email = ?").bind(email).first();
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Users WHERE id = ?").bind(id).first();
  }

  static async create({ id, name, email, password, phone, role }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Users (id, name, email, password, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, name, email, password, phone || null, role || "customer", now, now)
    .run();

    return { id, name, email, phone, role, created_at: now, updated_at: now };
  }

  static async update(id, { name, phone }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE Users SET name = ?, phone = ?, updated_at = ? WHERE id = ?"
    )
    .bind(name, phone || null, now, id)
    .run();

    return this.findById(id);
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Users WHERE id = ?").bind(id).run();
    return true;
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT id, name, email, phone, role, created_at, updated_at FROM Users"
    ).all();
    return results;
  }

  static async findAllCustomers() {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT id, name, email, phone, created_at, updated_at FROM Users WHERE role = 'customer'"
    ).all();
    return results;
  }
}
