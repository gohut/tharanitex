import { getDB } from "../database/db";

export class UserRepository {
  static async findByEmail(email, env) {
    const db = await getDB(env);
    if (!db) return null;
    return await db.prepare(`SELECT id, first_name || CASE WHEN last_name IS NOT NULL AND last_name != '' THEN ' ' || last_name ELSE '' END AS name, email, phone, password_hash AS password, role, created_at, created_at AS updated_at FROM users WHERE email = ?`).bind(email).first();
  }

  static async findById(id, env) {
    const db = await getDB(env);
    if (!db) return null;
    return await db.prepare(`SELECT id, first_name || CASE WHEN last_name IS NOT NULL AND last_name != '' THEN ' ' || last_name ELSE '' END AS name, email, phone, password_hash AS password, role, created_at, created_at AS updated_at FROM users WHERE id = ?`).bind(id).first();
  }

  static async create({ name, email, password, phone, role }, env) {
    const db = await getDB(env);
    if (!db) throw new Error("Database connection unavailable");
    const [firstName, ...remainingNames] = name.trim().split(/\s+/);
    const lastName = remainingNames.join(" ") || null;
    await db.prepare(
      "INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(firstName, lastName, email, phone || null, password, role || "customer")
    .run();

    return await this.findByEmail(email, env);
  }

  static async update(id, { name, phone }, env) {
    const db = await getDB(env);
    if (!db) throw new Error("Database connection unavailable");
    const [firstName, ...remainingNames] = name.trim().split(/\s+/);
    const lastName = remainingNames.join(" ") || null;
    await db.prepare(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?"
    )
    .bind(firstName, lastName, phone || null, id)
    .run();

    return this.findById(id, env);
  }

  static async delete(id, env) {
    const db = await getDB(env);
    if (!db) return false;
    await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    return true;
  }

  static async findAll(env) {
    const db = await getDB(env);
    if (!db) return [];
    const { results } = await db.prepare(
      "SELECT id, first_name || CASE WHEN last_name IS NOT NULL AND last_name != '' THEN ' ' || last_name ELSE '' END AS name, email, phone, role, created_at, created_at AS updated_at FROM users"
    ).all();
    return results || [];
  }

  static async findAllCustomers(env) {
    const db = await getDB(env);
    if (!db) return [];
    const { results } = await db.prepare(
      "SELECT id, first_name || CASE WHEN last_name IS NOT NULL AND last_name != '' THEN ' ' || last_name ELSE '' END AS name, email, phone, created_at, created_at AS updated_at FROM users WHERE role = 'customer'"
    ).all();
    return results || [];
  }
}

