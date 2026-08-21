export async function addToCart(
  db,
  userId,
  productId,
  variantId,
  quantity
) {
  if (!userId) {
    throw new Error("User is required");
  }

  if (!productId) {
    throw new Error("Product is required");
  }

  const normalizedVariantId =
    variantId === null ||
    variantId === undefined ||
    variantId === ""
      ? null
      : Number(variantId);

  const normalizedQuantity =
    Number(quantity) || 1;

  if (normalizedQuantity <= 0) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }

  /*
   * ============================================================
   * CHECK PRODUCT / VARIANT STOCK
   * ============================================================
   */

  if (normalizedVariantId !== null) {
    const variant = await db
      .prepare(`
        SELECT
          id,
          stock,
          is_active
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
      throw new Error(
        "Invalid product variant"
      );
    }

    if (!variant.is_active) {
      throw new Error(
        "This variant is unavailable"
      );
    }

    if (Number(variant.stock) <= 0) {
      throw new Error(
        "This variant is out of stock"
      );
    }

    if (
      normalizedQuantity >
      Number(variant.stock)
    ) {
      throw new Error(
        `Only ${variant.stock} available`
      );
    }
  } else {
    const product = await db
      .prepare(`
        SELECT
          stock
        FROM products
        WHERE id = ?
        LIMIT 1
      `)
      .bind(Number(productId))
      .first();

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    if (Number(product.stock) <= 0) {
      throw new Error(
        "This product is out of stock"
      );
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

  /*
   * ============================================================
   * FIND EXISTING CART ITEM
   * ============================================================
   *
   * IMPORTANT:
   * userId is ALWAYS part of the lookup.
   *
   * A customer can therefore never modify another customer's
   * cart item.
   */

  const existing = await db
    .prepare(`
      SELECT
        id,
        quantity
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

  /*
   * ============================================================
   * UPDATE EXISTING ITEM
   * ============================================================
   */

  if (existing) {
    const newQuantity =
      Number(existing.quantity) +
      normalizedQuantity;

    let availableStock;

    if (normalizedVariantId !== null) {
      const variant = await db
        .prepare(`
          SELECT
            stock,
            is_active
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
        throw new Error(
          "Invalid product variant"
        );
      }

      if (!variant.is_active) {
        throw new Error(
          "This variant is unavailable"
        );
      }

      availableStock =
        Number(variant.stock);
    } else {
      const product = await db
        .prepare(`
          SELECT
            stock
          FROM products
          WHERE id = ?
          LIMIT 1
        `)
        .bind(Number(productId))
        .first();

      if (!product) {
        throw new Error(
          "Product not found"
        );
      }

      availableStock =
        Number(product.stock);
    }

    if (
      newQuantity >
      availableStock
    ) {
      throw new Error(
        `Only ${availableStock} available`
      );
    }

    /*
     * IMPORTANT:
     * user_id is included in the UPDATE.
     */
    await db
      .prepare(`
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
          AND user_id = ?
      `)
      .bind(
        newQuantity,
        existing.id,
        userId
      )
      .run();

    return {
      success: true,
    };
  }

  /*
   * ============================================================
   * INSERT NEW CART ITEM
   * ============================================================
   */

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

  return {
    success: true,
  };
}


/*
 * ============================================================
 * GET CART
 * ============================================================
 *
 * Cart is ALWAYS retrieved by authenticated userId.
 */

export async function getCart(
  db,
  userId
) {
  if (!userId) {
    return [];
  }

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


/*
 * ============================================================
 * UPDATE CART QUANTITY
 * ============================================================
 */

export async function updateCartQuantity(
  db,
  userId,
  cartId,
  quantity
) {
  if (!userId) {
    throw new Error(
      "User is required"
    );
  }

  if (!cartId) {
    throw new Error(
      "Cart item is required"
    );
  }

  const normalizedQuantity =
    Number(quantity);

  if (
    !Number.isFinite(
      normalizedQuantity
    ) ||
    normalizedQuantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }

  /*
   * IMPORTANT:
   * Retrieve the cart item using BOTH
   * cartId and userId.
   */
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
    .bind(
      cartId,
      userId
    )
    .first();

  if (!cartItem) {
    throw new Error(
      "Cart item not found"
    );
  }

  const availableStock =
    cartItem.variant_id !== null
      ? Number(
          cartItem.variant_stock
        )
      : Number(
          cartItem.product_stock
        );

  if (
    normalizedQuantity >
    availableStock
  ) {
    throw new Error(
      `Only ${availableStock} available`
    );
  }

  /*
   * IMPORTANT:
   * user_id is ALSO included in the UPDATE.
   */
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


/*
 * ============================================================
 * REMOVE FROM CART
 * ============================================================
 *
 * There must be ONLY ONE removeFromCart function in this file.
 */

export async function removeFromCart(
  db,
  userId,
  cartId
) {
  if (!userId) {
    throw new Error(
      "User is required"
    );
  }

  if (!cartId) {
    throw new Error(
      "Cart item is required"
    );
  }

  /*
   * IMPORTANT:
   * Delete only if this cart item belongs
   * to the authenticated customer.
   */
  const result = await db
    .prepare(`
      DELETE FROM cart_items
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(
      cartId,
      userId
    )
    .run();

  if (!result.meta?.changes) {
    throw new Error(
      "Cart item not found"
    );
  }

  return {
    success: true,
  };
}