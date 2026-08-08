export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllCategories(db, { activeOnly = false } = {}) {
  const { results } = await db
    .prepare(`
      SELECT
        id,
        name,
        subtitle,
        slug,
        description,
        image_url AS image,
        is_active AS isActive,
        created_at AS createdAt
      FROM categories
      ${activeOnly ? "WHERE is_active = 1" : ""}
      ORDER BY name ASC
    `)
    .all();

  return results;
}

export async function getCategoryById(db, id) {
  return db
    .prepare(`
      SELECT
        id,
        name,
        subtitle,
        slug,
        description,
        image_url AS image,
        is_active AS isActive,
        created_at AS createdAt
      FROM categories
      WHERE id = ?
      LIMIT 1
    `)
    .bind(Number(id))
    .first();
}

export async function createCategory(db, data) {
  const slug = data.slug
    ? slugify(data.slug)
    : slugify(data.name);

  const result = await db
    .prepare(`
      INSERT INTO categories (
        name,
        subtitle,
        slug,
        description,
        image_url,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.name,
      data.subtitle || "",
      slug,
      data.description || "",
      data.image || null,
      data.isActive === false ? 0 : 1
    )
    .run();

  return {
    success: true,
    id: result.meta.last_row_id,
    slug,
  };
}

export async function updateCategory(db, id, data) {
  const slug = data.slug
    ? slugify(data.slug)
    : slugify(data.name);

  await db
    .prepare(`
      UPDATE categories
      SET
        name = ?,
        subtitle = ?,
        slug = ?,
        description = ?,
        image_url = ?,
        is_active = ?
      WHERE id = ?
    `)
    .bind(
      data.name,
      data.subtitle || "",
      slug,
      data.description || "",
      data.image || null,
      data.isActive === false ? 0 : 1,
      Number(id)
    )
    .run();

  return {
    success: true,
    slug,
  };
}

export async function categoryHasProducts(db, id) {
  const row = await db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE category_id = ?
    `)
    .bind(Number(id))
    .first();

  return Number(row?.count || 0) > 0;
}

export async function deleteCategory(db, id) {
  await db
    .prepare("DELETE FROM categories WHERE id = ?")
    .bind(Number(id))
    .run();

  return {
    success: true,
  };
}