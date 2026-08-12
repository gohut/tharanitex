import { getDB } from "../database/db";

export class BannerRepository {
  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare("SELECT * FROM Banners ORDER BY created_at DESC").all();
    return results;
  }

  static async findById(id) {
    const db = getDB();
    return await db.prepare("SELECT * FROM Banners WHERE id = ?").bind(id).first();
  }

  static async create({ title, image_key, link }) {
    const db = getDB();
    const id = "ban_" + crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Banners (id, title, image_key, link, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(id, title || null, image_key, link || null, now)
    .run();

    return { id, title, image_key, link, created_at: now };
  }

  static async update(id, { title, image_key, link }) {
    const db = getDB();
    await db.prepare(
      "UPDATE Banners SET title = ?, image_key = ?, link = ? WHERE id = ?"
    )
    .bind(title || null, image_key, link || null, id)
    .run();

    return { id, title, image_key, link };
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Banners WHERE id = ?").bind(id).run();
    return true;
  }
}
