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
    await db
      .prepare(`
        UPDATE cart_items
        SET quantity = quantity + ?
        WHERE id = ?
      `)
      .bind(
        normalizedQuantity,
        existing.id
      )
      .run();
  } else {
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
  cartId,
  quantity
) {
  const normalizedQuantity =
    Number(quantity);

  if (normalizedQuantity <= 0) {
    throw new Error(
      "Quantity must be greater than zero"
    );
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
      LIMIT 1
    `)
    .bind(cartId)
    .first();

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  const availableStock =
    cartItem.variant_id !== null
      ? Number(cartItem.variant_stock)
      : Number(cartItem.product_stock);

  if (normalizedQuantity > availableStock) {
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
      normalizedQuantity,
      cartId
    )
    .run();

  return {
    success: true,
  };
}


export async function removeFromCart(
  db,
  cartId
) {
  await db
    .prepare(`
      DELETE FROM cart_items
      WHERE id = ?
    `)
    .bind(cartId)
    .run();

  return {
    success: true,
  };
}