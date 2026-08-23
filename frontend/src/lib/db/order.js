export class CheckoutError extends Error {
  constructor(message, status = 400, context = {}) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
    this.context = context;
  }
}


function validQuantity(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 99;
}

async function trustedItems(
  db,
  checkoutType,
  productId,
  quantity,
  cartUserId,
  variantId = null
) {
    /*
    * BUY NOW
    *
    * Variant-aware:
    * - If variantId exists, use variant price/stock.
    * - Otherwise use product price/stock.
    */
    if (checkoutType === "BUY_NOW") {
      if (
        !validQuantity(quantity) ||
        !Number.isInteger(Number(productId)) ||
        Number(productId) <= 0
      ) {
        throw new CheckoutError(
          "Choose a valid product and quantity."
        );
      }

      const product = await db
        .prepare(`
          SELECT
            id,
            price,
            stock,
            is_active
          FROM products
          WHERE id = ?
        `)
        .bind(Number(productId))
        .first();

      if (
        !product ||
        Number(product.is_active) !== 1
      ) {
        throw new CheckoutError(
          "This product is no longer available.",
          404
        );
      }

      /*
      * BUY NOW WITH VARIANT
      */
      if (
        variantId !== null &&
        variantId !== undefined &&
        variantId !== ""
      ) {
        if (
          !Number.isInteger(Number(variantId)) ||
          Number(variantId) <= 0
        ) {
          throw new CheckoutError(
            "Invalid product variant."
          );
        }

        const variant = await db
          .prepare(`
            SELECT
              id,
              product_id,
              price,
              stock,
              is_active
            FROM product_variants
            WHERE id = ?
              AND product_id = ?
          `)
          .bind(
            Number(variantId),
            Number(productId)
          )
          .first();

        if (
          !variant ||
          Number(variant.is_active) !== 1
        ) {
          throw new CheckoutError(
            "This product variant is no longer available.",
            404
          );
        }

        if (
          !Number.isFinite(
            Number(variant.price)
          ) ||
          Number(variant.price) < 0
        ) {
          throw new CheckoutError(
            "This product variant has an invalid price.",
            409
          );
        }

        if (
          variant.stock === null ||
          Number(variant.stock) < 0 ||
          Number(quantity) >
            Number(variant.stock)
        ) {
          throw new CheckoutError(
            "The requested variant quantity is unavailable.",
            409
          );
        }

        return [
          {
            product_id: product.id,

            variant_id: variant.id,

            quantity:
              Number(quantity),

            price:
              Number(variant.price),
          },
        ];
      }

      /*
      * BUY NOW WITHOUT VARIANT
      */
      if (
        !Number.isFinite(
          Number(product.price)
        ) ||
        Number(product.price) < 0
      ) {
        throw new CheckoutError(
          "This product has an invalid price.",
          409
        );
      }

      if (
        product.stock !== null &&
        Number(product.stock) >= 0 &&
        Number(quantity) >
          Number(product.stock)
      ) {
        throw new CheckoutError(
          "The requested quantity is unavailable.",
          409
        );
      }

      return [
        {
          product_id: product.id,

          variant_id: null,

          quantity:
            Number(quantity),

          price:
            Number(product.price),
        },
      ];
    }

  /*
   * CART
   */
  if (checkoutType !== "CART") {
    throw new CheckoutError(
      "Invalid checkout type."
    );
  }

  const { results } =
    await db
      .prepare(`
        SELECT
          ci.product_id,
          ci.variant_id,
          ci.quantity,

          p.id AS resolved_product_id,
          p.price AS product_price,
          p.stock AS product_stock,
          p.is_active AS product_is_active,

          v.id AS resolved_variant_id,
          v.price AS variant_price,
          v.stock AS variant_stock,
          v.is_active AS variant_is_active

        FROM cart_items ci

        LEFT JOIN products p
          ON p.id = ci.product_id

        LEFT JOIN product_variants v
          ON v.id = ci.variant_id
          AND v.product_id = ci.product_id

        WHERE ci.user_id = ?
      `)
      .bind(cartUserId)
      .all();

  if (!results.length) {
    throw new CheckoutError(
      "Cart is empty",
      409
    );
  }

  return results.map((item) => {
    /*
     * Product must still exist and be active.
     */
    if (
      !item.resolved_product_id ||
      Number(
        item.product_is_active
      ) !== 1
    ) {
      throw new CheckoutError(
        "One of the products in your cart is no longer available.",
        409
      );
    }

    /*
     * Quantity must be valid.
     */
    if (
      !validQuantity(item.quantity)
    ) {
      throw new CheckoutError(
        "Your cart contains an invalid quantity.",
        409
      );
    }

    /*
     * CART ITEM WITH VARIANT
     *
     * This is the important fix.
     *
     * Previously checkout ignored
     * variant_id and used p.price.
     */
    if (
      item.variant_id !== null &&
      item.variant_id !== undefined
    ) {
      if (
        !item.resolved_variant_id ||
        Number(
          item.variant_is_active
        ) !== 1
      ) {
        throw new CheckoutError(
          "A selected product variant is no longer available.",
          409
        );
      }

      if (
        !Number.isFinite(
          Number(item.variant_price)
        ) ||
        Number(item.variant_price) < 0
      ) {
        throw new CheckoutError(
          "A cart variant has an invalid price.",
          409
        );
      }

      if (
        item.variant_stock !== null &&
        Number(item.variant_stock) >= 0 &&
        Number(item.quantity) >
          Number(item.variant_stock)
      ) {
        throw new CheckoutError(
          "A cart item quantity is unavailable.",
          409
        );
      }

      return {
        product_id:
          item.product_id,

        variant_id:
          item.variant_id,

        quantity:
          Number(item.quantity),

        price:
          Number(item.variant_price),
      };
    }

    /*
     * CART ITEM WITHOUT VARIANT
     */
    if (
      !Number.isFinite(
        Number(item.product_price)
      ) ||
      Number(item.product_price) < 0
    ) {
      throw new CheckoutError(
        "A cart item has an invalid price.",
        409
      );
    }

    if (
      item.product_stock !== null &&
      Number(item.product_stock) >= 0 &&
      Number(item.quantity) >
        Number(item.product_stock)
    ) {
      throw new CheckoutError(
        "A cart item quantity is unavailable.",
        409
      );
    }

    return {
      product_id:
        item.product_id,

      variant_id: null,

      quantity:
        Number(item.quantity),

      price:
        Number(item.product_price),
    };
  });
}

async function findOrCreateAddress(db, checkout) {
  const addressLines = checkout.deliveryAddress.split(/\n|,/).map((line) => line.trim()).filter(Boolean);
  const pincode = checkout.deliveryAddress.match(/\b\d{6}\b/)?.[0] || "000000";
  const city = addressLines.at(-2) || "Not specified";
  const state = addressLines.at(-1)?.replace(/\b\d{6}\b/, "").trim() || "Not specified";
  const existing = await db.prepare(`SELECT id FROM addresses WHERE user_id = ? AND full_name = ? AND phone = ? AND address_line1 = ? LIMIT 1`)
    .bind(checkout.userId, checkout.customerName, checkout.phone, checkout.deliveryAddress).first();
  if (existing) return existing.id;
  const result = await db.prepare(`INSERT INTO addresses (user_id, full_name, phone, address_line1, city, state, pincode, country) VALUES (?, ?, ?, ?, ?, ?, ?, 'India')`)
    .bind(checkout.userId, checkout.customerName, checkout.phone, checkout.deliveryAddress, city, state, pincode).run();
  return result.meta.last_row_id;
}

function total(items) {
  return items.reduce((amount, item) => amount + item.price * item.quantity, 0);
}

async function decrementInventory(db, items) {
  for (const item of items) {
    if (item.variant_id !== null && item.variant_id !== undefined) {
      const result = await db
        .prepare(`
          UPDATE product_variants
          SET stock = stock - ?
          WHERE id = ?
            AND product_id = ?
            AND is_active = 1
            AND stock >= ?
        `)
        .bind(
          item.quantity,
          item.variant_id,
          item.product_id,
          item.quantity
        )
        .run();

      if (!result.meta?.changes) {
        throw new CheckoutError(
          "A selected product variant is no longer available.",
          409
        );
      }
    } else {
      const result = await db
        .prepare(`
          UPDATE products
          SET stock = stock - ?
          WHERE id = ?
            AND is_active = 1
            AND stock >= ?
        `)
        .bind(
          item.quantity,
          item.product_id,
          item.quantity
        )
        .run();

      if (!result.meta?.changes) {
        throw new CheckoutError(
          "A product is no longer available in the requested quantity.",
          409
        );
      }
    }
  }
}



async function insertOrder(
  db,
  {
    userId,
    addressId,
    items,
    paymentMethod,
    paymentStatus,
    razorpay = null,
    clearCartUserId = null,
  }
) {
  const result = await db
    .prepare(`
      INSERT INTO orders (
        user_id,
        address_id,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paid_at
      )
      VALUES (?, ?, ?, ?, ?, 'placed', ?, ?, ?, ?)
    `)
    .bind(
      userId,
      addressId,
      total(items),
      paymentMethod,
      paymentStatus,
      razorpay?.orderId || null,
      razorpay?.paymentId || null,
      razorpay?.signature || null,
      paymentStatus === "paid"
        ? new Date().toISOString()
        : null
    )
    .run();

  const orderId = result.meta.last_row_id;

  try {
    const statements = [];

    // Deduct stock first.
    // This is variant-aware and protected by stock >= quantity.
    for (const item of items) {
      if (
        item.variant_id !== null &&
        item.variant_id !== undefined
      ) {
        statements.push(
          db
            .prepare(`
              UPDATE product_variants
              SET stock = stock - ?
              WHERE id = ?
                AND product_id = ?
                AND is_active = 1
                AND stock >= ?
            `)
            .bind(
              item.quantity,
              item.variant_id,
              item.product_id,
              item.quantity
            )
        );
      } else {
        statements.push(
          db
            .prepare(`
              UPDATE products
              SET stock = stock - ?
              WHERE id = ?
                AND is_active = 1
                AND stock >= ?
            `)
            .bind(
              item.quantity,
              item.product_id,
              item.quantity
            )
        );
      }
    }

    // Create order items.
    for (const item of items) {
      statements.push(
        db
          .prepare(`
            INSERT INTO order_items (
              order_id,
              product_id,
              variant_id,
              quantity,
              price
            )
            VALUES (?, ?, ?, ?, ?)
          `)
          .bind(
            orderId,
            item.product_id,
            item.variant_id ?? null,
            item.quantity,
            item.price
          )
      );
    }

    // Clear cart only for CART checkout.
    if (clearCartUserId) {
      statements.push(
        db
          .prepare(`
            DELETE FROM cart_items
            WHERE user_id = ?
          `)
          .bind(clearCartUserId)
      );
    }

    const results = await db.batch(statements);

    // First N statements are inventory updates.
    for (let i = 0; i < items.length; i++) {
      if (!results[i]?.meta?.changes) {
        throw new CheckoutError(
          "One or more items are no longer available in the requested quantity.",
          409
        );
      }
    }

    return orderId;
  } catch (error) {
    // The order was created before the inventory/order-item batch.
    // Remove it if the batch failed so we don't leave an orphan order.
    await db
      .prepare(`
        DELETE FROM orders
        WHERE id = ?
      `)
      .bind(orderId)
      .run()
      .catch(() => {});

    throw error;
  }
}

export async function createCodOrder(db, checkout) {
  const cartUserId = checkout.cartUserId || checkout.userId;
  const items = await trustedItems(
    db,
    checkout.checkoutType,
    checkout.productId,
    checkout.quantity,
    checkout.cartUserId || checkout.userId,
    checkout.variantId
  );
  const addressId = await findOrCreateAddress(db, checkout);
  const orderId = await insertOrder(db, { userId: checkout.userId, addressId, items, paymentMethod: "COD", paymentStatus: "pending", clearCartUserId: checkout.checkoutType === "CART" ? cartUserId : null });
  return { success: true, orderId, totalAmount: total(items), orderStatus: "placed", paymentMethod: "COD", paymentStatus: "pending" };
}

export async function prepareOnlineCheckout(db, checkout, razorpayOrder, publicKey) {
  const items = await trustedItems(db, checkout.checkoutType, checkout.productId, checkout.quantity, checkout.cartUserId || checkout.userId);
  const addressId = await findOrCreateAddress(db, checkout);
  const amountPaise = Math.round(total(items) * 100);
  const sessionId = crypto.randomUUID();
  const idempotencyKey = checkout.idempotencyKey || sessionId;
  const existing = await db.prepare("SELECT razorpay_order_id, amount_paise, payment_method, status FROM checkout_sessions WHERE idempotency_key = ? LIMIT 1").bind(idempotencyKey).first();
  if (existing?.razorpay_order_id && existing.status === "created") return { razorpayOrderId: existing.razorpay_order_id, amountPaise: existing.amount_paise, keyId: publicKey };
  if (existing) throw new CheckoutError("A payment request is already being prepared. Please wait and retry.", 409);
  await db.prepare(`INSERT INTO checkout_sessions (id, user_id, checkout_type, payment_method, amount_paise, address_id, items_json, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(sessionId, checkout.userId, checkout.checkoutType, checkout.paymentMethod, amountPaise, addressId, JSON.stringify(items), idempotencyKey).run();
  try {
    const gatewayOrder = await razorpayOrder({ amount: amountPaise, receipt: sessionId.replaceAll("-", "").slice(0, 40) });
    await db.prepare("UPDATE checkout_sessions SET razorpay_order_id = ?, status = 'created' WHERE id = ?").bind(gatewayOrder.id, sessionId).run();
    return { razorpayOrderId: gatewayOrder.id, amountPaise, keyId: gatewayOrder.keyId };
  } catch (error) {
    await db.prepare("UPDATE checkout_sessions SET status = 'failed' WHERE id = ?").bind(sessionId).run().catch(() => {});
    throw error;
  }
}

export async function claimVerifiedPayment(db, { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId }) {
  const session = await db.prepare("SELECT * FROM checkout_sessions WHERE razorpay_order_id = ? LIMIT 1").bind(razorpayOrderId).first();
  if (!session) throw new CheckoutError("Payment session not found.", 404);
  if (String(session.user_id) !== String(userId)) throw new CheckoutError("Payment session not found.", 404);
  // Recover safely if a prior request completed the order insert but was
  // interrupted before it could mark the checkout session completed.
  const existingOrder = await db.prepare("SELECT id FROM orders WHERE razorpay_order_id = ? LIMIT 1").bind(razorpayOrderId).first();
  if (existingOrder) {
    await db.prepare("UPDATE checkout_sessions SET status = 'completed', completed_order_id = ? WHERE id = ?").bind(existingOrder.id, session.id).run();
    return { orderId: existingOrder.id, duplicate: true };
  }
  if (session.status === "completed" && session.completed_order_id) return { orderId: session.completed_order_id, duplicate: true };
  const claim = await db.prepare("UPDATE checkout_sessions SET status = 'verifying' WHERE id = ? AND status = 'created'").bind(session.id).run();
  if (!claim.meta.changes) throw new CheckoutError("Payment verification is already in progress. Please refresh shortly.", 409);
  try {
    const items = JSON.parse(session.items_json);
    const orderId = await insertOrder(db, {
      userId: session.user_id, addressId: session.address_id, items, paymentMethod: session.payment_method,
      paymentStatus: "paid", razorpay: { orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature },
    });
    const statements = [db.prepare("UPDATE checkout_sessions SET status = 'completed', completed_order_id = ? WHERE id = ?").bind(orderId, session.id)];
    if (session.checkout_type === "CART") {
      statements.push(db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(session.user_id));
    }
    await db.batch(statements);
    return { orderId, duplicate: false };
  } catch (error) {
    await db.prepare("UPDATE checkout_sessions SET status = 'failed' WHERE id = ?").bind(session.id).run().catch(() => {});
    throw error;
  }
}

let cancellationColumnsChecked = false;

async function ensureCancellationColumns(db) {
  if (cancellationColumnsChecked || !db) return;
  const alterStatements = [
    "ALTER TABLE orders ADD COLUMN cancellation_status TEXT NOT NULL DEFAULT 'NONE'",
    "ALTER TABLE orders ADD COLUMN cancellation_reason TEXT",
    "ALTER TABLE orders ADD COLUMN cancellation_requested_at TEXT",
    "ALTER TABLE orders ADD COLUMN cancellation_decided_at TEXT",
    "ALTER TABLE orders ADD COLUMN cancelled_at TEXT",
    "ALTER TABLE orders ADD COLUMN cancelled_by TEXT",
    "ALTER TABLE orders ADD COLUMN delivered_at TEXT",
    "ALTER TABLE orders ADD COLUMN invoice_number TEXT",
    "ALTER TABLE orders ADD COLUMN refund_status TEXT NOT NULL DEFAULT 'NOT_REQUESTED'",
    "ALTER TABLE orders ADD COLUMN refund_id TEXT",
    "ALTER TABLE orders ADD COLUMN refund_amount REAL",
    "ALTER TABLE orders ADD COLUMN refund_requested_at TEXT",
    "ALTER TABLE orders ADD COLUMN refund_completed_at TEXT",
    "ALTER TABLE orders ADD COLUMN refund_failure_reason TEXT",
  ];
  for (const stmt of alterStatements) {
    try {
      await db.prepare(stmt).run();
    } catch (e) {
      // Ignore if column already exists
    }
  }
  cancellationColumnsChecked = true;
}

export async function getOrders(db, userId) {
  let orders = [];

  try {
    const res = await db
      .prepare(`
        SELECT
          o.id,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.cancellation_status,
          o.refund_status,
          a.full_name,
          a.city,
          a.state
        FROM orders o
        JOIN addresses a
          ON a.id = o.address_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `)
      .bind(userId)
      .all();

    orders = res.results || [];
  } catch (err) {
    const res = await db
      .prepare(`
        SELECT
          o.id,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          a.full_name,
          a.city,
          a.state
        FROM orders o
        JOIN addresses a
          ON a.id = o.address_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `)
      .bind(userId)
      .all();

    orders = (res.results || []).map((o) => ({
      ...o,
      cancellation_status: "NONE",
      refund_status: "NOT_REQUESTED",
    }));
  }

  if (!orders.length) {
    return orders;
  }

  const orderIds = orders.map((order) => order.id);
  const placeholders = orderIds
    .map(() => "?")
    .join(",");

  try {
    const { results: allItems } = await db
      .prepare(`
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.variant_id,
          oi.quantity,
          oi.price,
          p.name,
          p.slug,
          v.name AS variant_name,
          v.sku AS variant_sku,
          (
            SELECT image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY sort_order
            LIMIT 1
          ) AS image,

          CASE
            WHEN EXISTS (
              SELECT 1
              FROM reviews r
              WHERE CAST(r.user_id AS TEXT) = CAST(? AS TEXT)
                AND r.product_id = oi.product_id
                AND (
                  CAST(r.order_id AS TEXT) = CAST(oi.order_id AS TEXT)
                  OR r.order_id IS NULL
                )
            )
            THEN 1
            ELSE 0
          END AS has_review

        FROM order_items oi

        JOIN products p
          ON p.id = oi.product_id

        LEFT JOIN product_variants v
          ON v.id = oi.variant_id

        WHERE oi.order_id IN (${placeholders})
        ORDER BY oi.id
      `)
      .bind(
        String(userId),
        ...orderIds
      )
      .all();

    const itemsMap = new Map();

    for (const item of allItems || []) {
      if (!itemsMap.has(item.order_id)) {
        itemsMap.set(item.order_id, []);
      }

      itemsMap.get(item.order_id).push(item);
    }

    for (const order of orders) {
      order.items =
        itemsMap.get(order.id) || [];
    }
  } catch (error) {
    console.error(
      "Failed to load order items:",
      error
    );

    for (const order of orders) {
      order.items = order.items || [];
    }
  }

  return orders;
}

export async function getOrderById(db, orderId, userId) {
  let order = null;
  try {
    order = await db.prepare(`SELECT o.id, o.user_id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, o.razorpay_order_id, o.razorpay_payment_id, o.paid_at, o.cancellation_status, o.cancellation_reason, o.cancellation_requested_at, o.cancellation_decided_at, o.cancelled_at, o.delivered_at, o.invoice_number, o.refund_status, o.refund_id, o.refund_amount, o.refund_requested_at, o.refund_completed_at, o.refund_failure_reason, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.id = ? AND o.user_id = ? LIMIT 1`).bind(orderId, userId).first();
  } catch (err) {
    order = await db.prepare(`SELECT o.id, o.user_id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, o.razorpay_order_id, o.razorpay_payment_id, o.paid_at, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.id = ? AND o.user_id = ? LIMIT 1`).bind(orderId, userId).first();
    if (order) {
      order.cancellation_status = 'NONE';
      order.cancellation_reason = null;
      order.cancellation_requested_at = null;
      order.refund_status = 'NOT_REQUESTED';
    }
  }
  if (!order) return null;
  const { results } = await db.prepare(`SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.slug, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) AS image FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY oi.id`).bind(orderId).all();
  order.items = results;
  return order;
}

export async function getAdminOrderById(db, orderId) {
  let order = null;
  try {
    order = await db.prepare(`SELECT o.id, o.user_id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, o.razorpay_order_id, o.razorpay_payment_id, o.paid_at, o.cancellation_status, o.cancellation_reason, o.cancellation_requested_at, o.cancellation_decided_at, o.cancelled_at, o.delivered_at, o.invoice_number, o.refund_status, o.refund_id, o.refund_amount, o.refund_requested_at, o.refund_completed_at, o.refund_failure_reason, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.id = ? LIMIT 1`).bind(orderId).first();
  } catch (err) {
    order = await db.prepare(`SELECT o.id, o.user_id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.id = ? LIMIT 1`).bind(orderId).first();
    if (order) {
      order.cancellation_status = 'NONE';
      order.cancellation_reason = null;
      order.cancellation_requested_at = null;
      order.refund_status = 'NOT_REQUESTED';
    }
  }
  if (!order) return null;
  const { results } = await db.prepare(`
    SELECT
      oi.id,
      oi.product_id,
      oi.variant_id,
      oi.quantity,
      oi.price,
      p.name,
      p.slug,
      v.name AS variant_name,
      v.sku AS variant_sku,
      (
        SELECT image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY sort_order
        LIMIT 1
      ) AS image
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    LEFT JOIN product_variants v ON v.id = oi.variant_id
    WHERE oi.order_id = ?
    ORDER BY oi.id
  `).bind(orderId).all();
  order.items = results;
  return order;
}

export async function getAdminOrders(db) {
  let results = [];
  try {
    const res = await db.prepare(`SELECT o.id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, o.cancellation_status, o.refund_status, a.full_name, a.phone FROM orders o JOIN addresses a ON a.id = o.address_id ORDER BY o.created_at DESC`).all();
    results = res.results || [];
  } catch (err) {
    const res = await db.prepare(`SELECT o.id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, a.full_name, a.phone FROM orders o JOIN addresses a ON a.id = o.address_id ORDER BY o.created_at DESC`).all();
    results = (res.results || []).map(o => ({ ...o, cancellation_status: 'NONE', refund_status: 'NOT_REQUESTED' }));
  }

  if (results.length > 0) {
    const orderIds = results.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(",");
    try {
      const { results: allItems } = await db
        .prepare(`SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (${placeholders}) ORDER BY oi.id`)
        .bind(...orderIds)
        .all();

      const itemsMap = new Map();
      for (const item of allItems || []) {
        if (!itemsMap.has(item.order_id)) itemsMap.set(item.order_id, []);
        itemsMap.get(item.order_id).push(item);
      }
      for (const order of results) {
        order.items = itemsMap.get(order.id) || [];
      }
    } catch {
      for (const order of results) {
        order.items = order.items || [];
      }
    }
  }

  return results;
}
