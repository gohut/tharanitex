import { getDB } from "../database/db";

export class ProductRepository {
  static async findById(id) {
    const db = getDB();
    return await db.prepare(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?`
    )
    .bind(id)
    .first();
  }

  static async findAll() {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
       FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC`
    ).all();
    return results || [];
  }

  static async query({ search, category_id, min_price, max_price, material, fabric, color, sort, limit = 20, offset = 0 }) {
    const db = getDB();
    let query = `SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image,
                 (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
                 FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1`;
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
    const mat = material || fabric;
    if (mat) {
      query += " AND p.material = ?";
      params.push(mat);
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
    return results || [];
  }

  static async create({ category_id, name, slug, description, price, stock, material, fabric, color, occasion, is_active }) {
    const db = getDB();
    const now = new Date().toISOString();
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const result = await db.prepare(
      "INSERT INTO products (category_id, name, slug, description, price, stock, material, color, occasion, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      category_id,
      name,
      productSlug,
      description || null,
      price,
      stock || 0,
      material || fabric || null,
      color || null,
      occasion || null,
      is_active !== undefined ? is_active : 1,
      now
    )
    .run();

    return this.findById(result.meta?.last_row_id);
  }

  static async update(id, { category_id, name, slug, description, price, stock, material, fabric, color, occasion, is_active }) {
    const db = getDB();
    const productSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : undefined);
    await db.prepare(
      `UPDATE products
       SET category_id = COALESCE(?, category_id),
           name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           stock = COALESCE(?, stock),
           material = COALESCE(?, material),
           color = COALESCE(?, color),
           occasion = COALESCE(?, occasion),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`
    )
    .bind(
      category_id || null,
      name || null,
      productSlug || null,
      description || null,
      price !== undefined ? price : null,
      stock !== undefined ? stock : null,
      material || fabric || null,
      color || null,
      occasion || null,
      is_active !== undefined ? is_active : null,
      id
    )
    .run();

    return this.findById(id);
  }

  static async updateStock(id, newStock) {
    const db = getDB();
    await db.prepare(
      "UPDATE products SET stock = ? WHERE id = ?"
    )
    .bind(newStock, id)
    .run();

    return true;
  }

  static async delete(id) {
    const db = getDB();
    await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return true;
  }

  static async findLowStock(threshold = 5) {
    const db = getDB();
    const { results } = await db.prepare(
      `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) as image
       FROM products p JOIN categories c ON p.category_id = c.id WHERE p.stock <= ? ORDER BY p.stock ASC`
    )
    .bind(threshold)
    .all();
    return results || [];
  }

  static async countAll() {
    const db = getDB();
    const result = await db.prepare("SELECT COUNT(*) as count FROM products").first();
    return result ? result.count : 0;
  }
}
