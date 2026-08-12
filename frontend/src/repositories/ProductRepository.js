import { getDB } from "../database/db";

export class ProductRepository {
  static async findById(id) {
    const db = getDB();
    return await db.prepare(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image
       FROM Products p JOIN Categories c ON p.category_id = c.id WHERE p.id = ?`
    )
    .bind(id)
    .first();
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image
       FROM Products p JOIN Categories c ON p.category_id = c.id ORDER BY p.created_at DESC`
    ).all();
    return results;
  }

  static async query({ search, category_id, min_price, max_price, fabric, color, sort, limit = 20, offset = 0 }) {
    const db = getDB();
    let query = `SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image
                 FROM Products p JOIN Categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      query += " AND p.category_id = ?";
      params.push(category_id);
    }
    if (min_price !== undefined && min_price !== null) {
      query += " AND p.price >= ?";
      params.push(Number(min_price));
    }
    if (max_price !== undefined && max_price !== null) {
      query += " AND p.price <= ?";
      params.push(Number(max_price));
    }
    if (fabric) {
      query += " AND p.fabric = ?";
      params.push(fabric);
    }
    if (color) {
      query += " AND p.color = ?";
      params.push(color);
    }

    if (sort === "price_asc") {
      query += " ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY p.price DESC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const statement = db.prepare(query);
    const { results } = await statement.bind(...params).all();
    return results;
  }

  static async create({ id, category_id, name, description, price, stock, fabric, color, image_url }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO Products (id, category_id, name, description, price, stock, fabric, color, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      id,
      category_id,
      name,
      description || null,
      price,
      stock,
      fabric || null,
      color || null,
      image_url || null,
      now,
      now
    )
    .run();

    return this.findById(id);
  }

  static async update(id, { category_id, name, description, price, stock, fabric, color, image_url }) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE Products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, fabric = ?, color = ?, image_url = ?, updated_at = ? WHERE id = ?"
    )
    .bind(
      category_id,
      name,
      description || null,
      price,
      stock,
      fabric || null,
      color || null,
      image_url || null,
      now,
      id
    )
    .run();

    return this.findById(id);
  }

  static async updateStock(id, newStock) {
    const db = getDB();
    const now = new Date().toISOString();
    await db.prepare(
      "UPDATE Products SET stock = ?, updated_at = ? WHERE id = ?"
    )
    .bind(newStock, now, id)
    .run();

    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM Products WHERE id = ?").bind(id).run();
    return true;
  }

  static async findLowStock(threshold = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT p.*, c.name as category_name FROM Products p JOIN Categories c ON p.category_id = c.id WHERE p.stock <= ? ORDER BY p.stock ASC"
    )
    .bind(threshold)
    .all();
    return results;
  }

  static async countAll() {
    const db = getDB();
    const result = await db.prepare("SELECT COUNT(*) as count FROM Products").first();
    return result ? result.count : 0;
  }
}
