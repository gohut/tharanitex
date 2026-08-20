function normalizedVariantId(value) {
  return value === null || value === undefined || value === "" ? null : Number(value);
}

async function availableItem(db, productId, variantId) {
  if (variantId !== null) {
    const variant = await db.prepare(`SELECT id, price, stock, is_active FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1`)
      .bind(variantId, productId).first();
    if (!variant) throw new Error("Invalid product variant");
    if (!variant.is_active) throw new Error("This variant is unavailable");
    return { stock: Number(variant.stock), price: Number(variant.price) };
  }
  const product = await db.prepare(`SELECT id, stock, price, is_active FROM products WHERE id = ? LIMIT 1`)
    .bind(productId).first();
  if (!product || !product.is_active) throw new Error("Product not found");
  return { stock: Number(product.stock), price: Number(product.price) };
}

function validateQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantity must be greater than zero");
  return quantity;
}

export async function addToCart(db, userId, productId, variantId = null, quantity = 1) {
  const id = Number(productId);
  const variant = normalizedVariantId(variantId);
  const addQuantity = validateQuantity(quantity);
  if (!Number.isInteger(id) || id <= 0 || (variant !== null && (!Number.isInteger(variant) || variant <= 0))) {
    throw new Error("Invalid cart item");
  }
  const item = await availableItem(db, id, variant);
  if (item.stock <= 0) throw new Error("This item is out of stock");
  const existing = await db.prepare(`SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND COALESCE(variant_id, -1) = COALESCE(?, -1) LIMIT 1`)
    .bind(userId, id, variant).first();
  const finalQuantity = (Number(existing?.quantity) || 0) + addQuantity;
  if (finalQuantity > item.stock) throw new Error(`Only ${item.stock} available`);
  if (existing) {
    await db.prepare(`UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?`).bind(finalQuantity, existing.id, userId).run();
  } else {
    await db.prepare(`INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)`)
      .bind(userId, id, variant, addQuantity).run();
  }
  return { success: true };
}

export async function getCart(db, userId) {
  const { results } = await db.prepare(`
    SELECT c.id, c.quantity, p.id AS product_id, p.name, p.slug, p.price, c.variant_id,
      v.name AS variant_name, v.sku AS variant_sku, v.price AS variant_price, v.stock AS variant_stock, v.image_url AS variant_image,
      CASE WHEN v.id IS NOT NULL THEN v.price ELSE p.price END AS final_price,
      CASE WHEN v.id IS NOT NULL THEN v.image_url ELSE (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) END AS image
    FROM cart_items c JOIN products p ON p.id = c.product_id LEFT JOIN product_variants v ON v.id = c.variant_id
    WHERE c.user_id = ? ORDER BY c.created_at DESC
  `).bind(userId).all();
  return results;
}

export async function updateCartQuantity(db, userId, cartId, quantity) {
  const nextQuantity = validateQuantity(quantity);
  const item = await db.prepare(`
    SELECT c.id, c.variant_id, p.stock AS product_stock, v.stock AS variant_stock
    FROM cart_items c JOIN products p ON p.id = c.product_id LEFT JOIN product_variants v ON v.id = c.variant_id
    WHERE c.id = ? AND c.user_id = ? LIMIT 1
  `).bind(cartId, userId).first();
  if (!item) throw Object.assign(new Error("Cart item not found."), { status: 404 });
  const available = item.variant_id !== null ? Number(item.variant_stock) : Number(item.product_stock);
  if (nextQuantity > available) throw new Error(`Only ${available} available`);
  await db.prepare(`UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?`).bind(nextQuantity, cartId, userId).run();
  return { success: true };
}

export async function removeFromCart(db, userId, cartId) {
  const result = await db.prepare(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`).bind(cartId, userId).run();
  if (!result.meta.changes) throw Object.assign(new Error("Cart item not found."), { status: 404 });
  return { success: true };
}
