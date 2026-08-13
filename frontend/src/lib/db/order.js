export async function createOrder(db, { userId, customerName, phone, deliveryAddress, paymentMethod }) {
  // Get cart items with current product prices
  const { results: cartItems } = await db
    .prepare(`
      SELECT
        ci.product_id,
        ci.quantity,
        p.price
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.user_id = ?
    `)
    .bind("guest")
    .all();

  if (!cartItems.length) {
    throw new Error("Cart is empty");
  }

  // Calculate order total
  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const addressLines = deliveryAddress
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
  const pincode = deliveryAddress.match(/\b\d{6}\b/)?.[0] || "000000";
  const city = addressLines.at(-2) || "Not specified";
  const state = addressLines.at(-1)?.replace(/\b\d{6}\b/, "").trim() || "Not specified";

  // Keep the complete customer-entered address in the existing address record.
  // The derived city/state fields retain compatibility with the current schema.
  const addressResult = await db
    .prepare(`
      INSERT INTO addresses (user_id, full_name, phone, address_line1, city, state, pincode, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'India')
    `)
    .bind(userId, customerName, phone, deliveryAddress, city, state, pincode)
    .run();
  const addressId = addressResult.meta.last_row_id;

  // Create order using the existing order/status structure.
  const result = await db
    .prepare(`
      INSERT INTO orders (
        user_id,
        address_id,
        total_amount,
        payment_method,
        payment_status,
        order_status
      )
      VALUES (?, ?, ?, ?, 'pending', 'placed')
    `)
    .bind(userId, addressId, totalAmount, paymentMethod)
    .run();

  const orderId = result.meta.last_row_id;

  // Copy cart items into order_items
  for (const item of cartItems) {
    await db
      .prepare(`
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        orderId,
        item.product_id,
        item.quantity,
        item.price
      )
      .run();
  }

  // Clear cart after order creation
  await db
    .prepare(`
      DELETE FROM cart_items
      WHERE user_id = ?
    `)
    .bind("guest")
    .run();

  return {
    success: true,
    orderId,
    totalAmount,
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
