export async function getFeaturedProducts(db) {
  const { results } = await db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        c.name AS category,
        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order
          LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.featured = 1
      AND p.is_active = 1
      ORDER BY p.id DESC;
    `)
    .all();

  return results;
}

export async function getAllProducts(db) {
  const { results } = await db.prepare(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.description,
      p.stock,
      c.name AS category,
      (
        SELECT image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY sort_order
        LIMIT 1
      ) AS image
    FROM products p
    JOIN categories c
      ON c.id = p.category_id
    WHERE p.is_active = 1
    ORDER BY p.id DESC;
  `).all();

  return results;
}