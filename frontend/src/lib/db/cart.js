export async function addToCart(db, userId, productId, quantity) {
  const existing = await db
    .prepare(`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ?
      AND product_id = ?
    `)
    .bind(userId, productId)
    .first();

  if (existing) {
    await db
      .prepare(`
        UPDATE cart_items
        SET quantity = quantity + ?
        WHERE id = ?
      `)
      .bind(quantity, existing.id)
      .run();
  } else {
    await db
      .prepare(`
        INSERT INTO cart_items (
          user_id,
          product_id,
          quantity
        )
        VALUES (?, ?, ?)
      `)
      .bind(userId, productId, quantity)
      .run();
  }

  return { success: true };
}

export async function getCart(db, userId) {
  const { results } = await db
    .prepare(`
      SELECT
        c.id,
        c.quantity,
        p.id AS product_id,
        p.name,
        p.slug,
        p.price,
        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order
          LIMIT 1
        ) AS image
      FROM cart_items c
      JOIN products p
        ON p.id = c.product_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `)
    .bind(userId)
    .all();

  return results;
}

export async function updateCartQuantity(db, cartId, quantity) {
  await db
    .prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
    `)
    .bind(quantity, cartId)
    .run();

  return { success: true };
}

export async function removeFromCart(db, cartId) {
  await db
    .prepare(`
      DELETE FROM cart_items
      WHERE id = ?
    `)
    .bind(cartId)
    .run();

  return { success: true };
}