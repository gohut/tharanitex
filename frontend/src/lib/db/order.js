export async function createOrder(db, userId, addressId) {
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

  // Create order
  const result = await db
    .prepare(`
      INSERT INTO orders (
        user_id,
        address_id,
        total_amount,
        payment_status,
        order_status
      )
      VALUES (?, ?, ?, 'pending', 'placed')
    `)
    .bind(userId, addressId, totalAmount)
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