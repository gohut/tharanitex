export class CheckoutError extends Error {
  constructor(message, status = 400, context = {}) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
    this.context = context;
  }
}

export async function createOrder(db, checkout, legacyAddressId) {
  // Read every cart row first so a stale product or invalid quantity cannot
  // silently produce a partial order.
  const { results: cartItems } = await db
    .prepare(`
      SELECT
        ci.product_id,
        ci.quantity,
        p.price,
        p.id AS resolved_product_id
      FROM cart_items ci
      LEFT JOIN products p
        ON p.id = ci.product_id
      WHERE ci.user_id = ?
    `)
    .bind("guest")
    .all();

  if (!cartItems.length) {
    throw new CheckoutError("Cart is empty", 409, { cartItemCount: 0 });
  }

  for (const item of cartItems) {
    if (!item.resolved_product_id) {
      throw new CheckoutError("One of the products in your cart is no longer available.", 409, { cartItemCount: cartItems.length });
    }
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw new CheckoutError("Your cart contains an invalid quantity. Please update it and try again.", 409, { cartItemCount: cartItems.length });
    }
    if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
      throw new CheckoutError("A cart item has an invalid price. Please try again.", 409, { cartItemCount: cartItems.length });
    }
  }

  // The total is always calculated from current D1 prices, never from client input.
  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const isLegacyCheckout = typeof checkout === "number";
  let userId = checkout?.userId;
  let addressId = legacyAddressId;
  let paymentMethod = "COD";
  let createdAddressId = null;

  if (!isLegacyCheckout) {
    if (!checkout || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      throw new CheckoutError("Invalid checkout request.", 400);
    }
    if (checkout.paymentMethod !== "COD") {
      throw new CheckoutError("Only Cash on Delivery is currently available.", 400);
    }
    const addressLines = checkout.deliveryAddress
      .split(/\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);
    const pincode = checkout.deliveryAddress.match(/\b\d{6}\b/)?.[0] || "000000";
    const city = addressLines.at(-2) || "Not specified";
    const state = addressLines.at(-1)?.replace(/\b\d{6}\b/, "").trim() || "Not specified";

    const existingAddress = await db
      .prepare(`
        SELECT id FROM addresses
        WHERE user_id = ? AND full_name = ? AND phone = ? AND address_line1 = ?
        LIMIT 1
      `)
      .bind(userId, checkout.customerName, checkout.phone, checkout.deliveryAddress)
      .first();

    if (existingAddress) {
      addressId = existingAddress.id;
    } else {
      const addressResult = await db
        .prepare(`
          INSERT INTO addresses (user_id, full_name, phone, address_line1, city, state, pincode, country)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'India')
        `)
        .bind(userId, checkout.customerName, checkout.phone, checkout.deliveryAddress, city, state, pincode)
        .run();
      addressId = addressResult.meta.last_row_id;
      createdAddressId = addressId;
    }
    paymentMethod = checkout.paymentMethod;
  } else {
    userId = checkout;
    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(addressId) || addressId <= 0) {
      throw new CheckoutError("Invalid order request.", 400);
    }
  }

  let orderId;
  try {
    const result = await db
      .prepare(`
        INSERT INTO orders (user_id, address_id, total_amount, payment_method, payment_status, order_status)
        VALUES (?, ?, ?, ?, 'pending', 'placed')
      `)
      .bind(userId, addressId, totalAmount, paymentMethod)
      .run();
    orderId = result.meta.last_row_id;

    // D1 batch commits all line items and the cart clear together. If an item
    // insert fails, the cart is retained and cleanup below removes this order.
    await db.batch([
      ...cartItems.map((item) => db
        .prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`)
        .bind(orderId, item.product_id, item.quantity, item.price)),
      db.prepare(`DELETE FROM cart_items WHERE user_id = ?`).bind("guest"),
    ]);
  } catch (error) {
    if (orderId) {
      await db.batch([
        db.prepare(`DELETE FROM order_items WHERE order_id = ?`).bind(orderId),
        db.prepare(`DELETE FROM orders WHERE id = ?`).bind(orderId),
        ...(createdAddressId ? [db.prepare(`DELETE FROM addresses WHERE id = ?`).bind(createdAddressId)] : []),
      ]).catch((cleanupError) => console.error("Checkout cleanup failed", {
        message: cleanupError?.message,
        orderId,
      }));
    } else if (createdAddressId) {
      await db.prepare(`DELETE FROM addresses WHERE id = ?`).bind(createdAddressId).run()
        .catch((cleanupError) => console.error("Checkout address cleanup failed", { message: cleanupError?.message }));
    }
    throw error;
  }

  return {
    success: true,
    orderId,
    totalAmount,
    orderStatus: "placed",
    paymentMethod,
    paymentStatus: "pending",
  };
}


export async function getOrders(db, userId) {
  const { results: orders } = await db
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

  for (const order of orders) {
    const { results: items } = await db
      .prepare(`
        SELECT
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name,
          p.slug,
          (
            SELECT image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY sort_order
            LIMIT 1
          ) AS image
        FROM order_items oi
        JOIN products p
          ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `)
      .bind(order.id)
      .all();

    order.items = items;
  }

  return orders;
}


export async function getOrderById(db, orderId, userId) {
  const order = await db
    .prepare(`
      SELECT
        o.id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,

        a.full_name,
        a.phone,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.pincode,
        a.country

      FROM orders o

      JOIN addresses a
        ON a.id = o.address_id

      WHERE o.id = ?
      AND o.user_id = ?

      LIMIT 1
    `)
    .bind(orderId, userId)
    .first();

  if (!order) {
    return null;
  }

  const { results: items } = await db
    .prepare(`
      SELECT
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,

        p.name,
        p.slug,

        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order
          LIMIT 1
        ) AS image

      FROM order_items oi

      JOIN products p
        ON p.id = oi.product_id

      WHERE oi.order_id = ?

      ORDER BY oi.id
    `)
    .bind(orderId)
    .all();

  order.items = items;

  return order;
}
