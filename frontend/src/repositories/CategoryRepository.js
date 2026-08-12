import { getDB } from "../database/db";

export class CategoryRepository {
  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare("SELECT * FROM Categories").all();
    return results;
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Categories WHERE id = ?").bind(id).first();
  }

  static async findByName(name) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Categories WHERE name = ?").bind(name).first();
  }

  static async create({ id, name, description }) {
    const db = getDB();
    await db.prepare(
      "INSERT INTO Categories (id, name, description) VALUES (?, ?, ?)"
    )
    .bind(id, name, description || null)
    .run();

    return { id, name, description };
  }

  static async update(id, { name, description }) {
    const db = getDB();
    await db.prepare(
      "UPDATE Categories SET name = ?, description = ? WHERE id = ?"
    )
    .bind(name, description || null, id)
    .run();

    return { id, name, description };
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Categories WHERE id = ?").bind(id).run();
    return true;
  }
}
