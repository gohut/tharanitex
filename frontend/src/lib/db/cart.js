export async function addToCart(
  db,
  userId,
  productId,
  variantId,
  quantity
) {
  const normalizedVariantId =
    variantId === null ||
    variantId === undefined ||
    variantId === ""
      ? null
      : Number(variantId);

  const normalizedQuantity =
    Number(quantity) || 1;

  // Check that the variant belongs to the product
  if (normalizedVariantId !== null) {
    const variant = await db
      .prepare(`
        SELECT id, stock, is_active
        FROM product_variants
        WHERE id = ?
          AND product_id = ?
        LIMIT 1
      `)
      .bind(
        normalizedVariantId,
        Number(productId)
      )
      .first();

    if (!variant) {
      throw new Error("Invalid product variant");
    }

    if (!variant.is_active) {
      throw new Error("This variant is unavailable");
    }

    if (Number(variant.stock) <= 0) {
      throw new Error("This variant is out of stock");
    }

    if (normalizedQuantity > Number(variant.stock)) {
      throw new Error(
        `Only ${variant.stock} available`
      );
    }
  } else {
    // Normal product without variants
    const product = await db
      .prepare(`
        SELECT stock
        FROM products
        WHERE id = ?
        LIMIT 1
      `)
      .bind(Number(productId))
      .first();

    if (!product) {
      throw new Error("Product not found");
    }

    if (Number(product.stock) <= 0) {
      throw new Error("This product is out of stock");
    }

    if (
      normalizedQuantity >
      Number(product.stock)
    ) {
      throw new Error(
        `Only ${product.stock} available`
      );
    }
  }

  const existing = await db
    .prepare(`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ?
        AND product_id = ?
        AND (
          variant_id = ?
          OR (
            variant_id IS NULL
            AND ? IS NULL
          )
        )
      LIMIT 1
    `)
    .bind(
      userId,
      Number(productId),
      normalizedVariantId,
      normalizedVariantId
    )
    .first();

  if (existing) {
  const newQuantity =
    Number(existing.quantity) + normalizedQuantity;

  let availableStock;

  if (normalizedVariantId !== null) {
    const variant = await db
      .prepare(`
        SELECT stock, is_active
        FROM product_variants
        WHERE id = ?
          AND product_id = ?
        LIMIT 1
      `)
      .bind(
        normalizedVariantId,
        Number(productId)
      )
      .first();

    if (!variant) {
      throw new Error("Invalid product variant");
    }

    if (!variant.is_active) {
      throw new Error("This variant is unavailable");
    }

    availableStock = Number(variant.stock);
  } else {
    const product = await db
      .prepare(`
        SELECT stock
        FROM products
        WHERE id = ?
        LIMIT 1
      `)
      .bind(Number(productId))
      .first();

    if (!product) {
      throw new Error("Product not found");
    }

    availableStock = Number(product.stock);
  }

  if (newQuantity > availableStock) {
    throw new Error(
      `Only ${availableStock} available`
    );
  }

  await db
    .prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
    `)
    .bind(
      newQuantity,
      existing.id
    )
    .run();
}

if (!existing) {
    await db
        .prepare(`
            INSERT INTO cart_items (
                user_id,
                product_id,
                variant_id,
                quantity
            )
            VALUES (?, ?, ?, ?)
        `)
        .bind(
            userId,
            Number(productId),
            normalizedVariantId,
            normalizedQuantity
        )
        .run();
}

  return {
    success: true,
  };
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

        c.variant_id,

        v.name AS variant_name,
        v.sku AS variant_sku,
        v.price AS variant_price,
        v.stock AS variant_stock,
        v.image_url AS variant_image,

        CASE
          WHEN v.id IS NOT NULL
            THEN v.price
          ELSE p.price
        END AS final_price,

        CASE
          WHEN v.id IS NOT NULL
            THEN v.image_url
          ELSE (
            SELECT image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY sort_order
            LIMIT 1
          )
        END AS image

      FROM cart_items c

      JOIN products p
        ON p.id = c.product_id

      LEFT JOIN product_variants v
        ON v.id = c.variant_id

      WHERE c.user_id = ?

      ORDER BY c.created_at DESC
    `)
    .bind(userId)
    .all();

  return results;
}


export async function updateCartQuantity(
  db,
  userId,
  cartId,
  quantity
) {
  const normalizedQuantity = Number(quantity);

  if (normalizedQuantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const cartItem = await db
    .prepare(`
      SELECT
        c.product_id,
        c.variant_id,
        v.stock AS variant_stock,
        p.stock AS product_stock
      FROM cart_items c
      JOIN products p
        ON p.id = c.product_id
      LEFT JOIN product_variants v
        ON v.id = c.variant_id
      WHERE c.id = ?
        AND c.user_id = ?
      LIMIT 1
    `)
    .bind(cartId, userId)
    .first();

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  const availableStock =
    cartItem.variant_id !== null
      ? Number(cartItem.variant_stock)
      : Number(cartItem.product_stock);

  if (normalizedQuantity > availableStock) {
    throw new Error(`Only ${availableStock} available`);
  }

  await db
    .prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(
      normalizedQuantity,
      cartId,
      userId
    )
    .run();

  return {
    success: true,
  };
}

export async function removeFromCart(
  db,
  userId,
  cartId
) {
  if (!userId) {
    throw new Error("User is required");
  }

  if (!cartId) {
    throw new Error("Cart item is required");
  }

  const result = await db
    .prepare(`
      DELETE FROM cart_items
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(cartId, userId)
    .run();

  if (!result.meta?.changes) {
    throw new Error("Cart item not found");
  }

  return {
    success: true,
  };
}