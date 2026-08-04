export async function getWishlist(db, userId) {
  const { results } = await db
    .prepare(`
      SELECT
        w.id,
        p.id AS product_id,
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
      FROM wishlist_items w
      JOIN products p
        ON p.id = w.product_id
      JOIN categories c
        ON c.id = p.category_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `)
    .bind(userId)
    .all();

  return results;
}

export async function addToWishlist(db, userId, productId) {
  await db
    .prepare(`
      INSERT OR IGNORE INTO wishlist_items (
        user_id,
        product_id
      )
      VALUES (?, ?)
    `)
    .bind(userId, productId)
    .run();

  return { success: true };
}

export async function removeFromWishlist(db, userId, productId) {
  await db
    .prepare(`
      DELETE FROM wishlist_items
      WHERE user_id = ?
      AND product_id = ?
    `)
    .bind(userId, productId)
    .run();

  return { success: true };
}