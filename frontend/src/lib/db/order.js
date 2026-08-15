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

async function trustedItems(db, checkoutType, productId, quantity, cartUserId) {
  if (checkoutType === "BUY_NOW") {
    if (!validQuantity(quantity) || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      throw new CheckoutError("Choose a valid product and quantity.");
    }
    const product = await db.prepare("SELECT id, price, stock, is_active FROM products WHERE id = ?").bind(Number(productId)).first();
    if (!product || Number(product.is_active) !== 1) throw new CheckoutError("This product is no longer available.", 404);
    if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) throw new CheckoutError("This product has an invalid price.", 409);
    if (product.stock !== null && Number(product.stock) > 0 && Number(quantity) > Number(product.stock)) {
      throw new CheckoutError("The requested quantity is unavailable.", 409);
    }
    return [{ product_id: product.id, quantity: Number(quantity), price: Number(product.price) }];
  }

  if (checkoutType !== "CART") throw new CheckoutError("Invalid checkout type.");
  const { results } = await db.prepare(`
    SELECT ci.product_id, ci.quantity, p.id AS resolved_product_id, p.price, p.stock, p.is_active
    FROM cart_items ci LEFT JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ?
  `).bind(cartUserId).all();
  if (!results.length) throw new CheckoutError("Cart is empty", 409);
  return results.map((item) => {
    if (!item.resolved_product_id || Number(item.is_active) !== 1) throw new CheckoutError("One of the products in your cart is no longer available.", 409);
    if (!validQuantity(item.quantity)) throw new CheckoutError("Your cart contains an invalid quantity.", 409);
    if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) throw new CheckoutError("A cart item has an invalid price.", 409);
    if (item.stock !== null && Number(item.stock) > 0 && Number(item.quantity) > Number(item.stock)) throw new CheckoutError("A cart item quantity is unavailable.", 409);
    return { product_id: item.product_id, quantity: Number(item.quantity), price: Number(item.price) };
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

async function insertOrder(db, { userId, addressId, items, paymentMethod, paymentStatus, razorpay = null }) {
  const result = await db.prepare(`
    INSERT INTO orders (user_id, address_id, total_amount, payment_method, payment_status, order_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, paid_at)
    VALUES (?, ?, ?, ?, ?, 'placed', ?, ?, ?, ?)
  `).bind(userId, addressId, total(items), paymentMethod, paymentStatus, razorpay?.orderId || null, razorpay?.paymentId || null, razorpay?.signature || null, paymentStatus === "paid" ? new Date().toISOString() : null).run();
  const orderId = result.meta.last_row_id;
  await db.batch(items.map((item) => db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)").bind(orderId, item.product_id, item.quantity, item.price)));
  return orderId;
}

export async function createCodOrder(db, checkout) {
  const items = await trustedItems(db, checkout.checkoutType, checkout.productId, checkout.quantity, checkout.userId);
  const addressId = await findOrCreateAddress(db, checkout);
  const orderId = await insertOrder(db, { userId: checkout.userId, addressId, items, paymentMethod: "COD", paymentStatus: "pending" });
  if (checkout.checkoutType === "CART") await db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(checkout.userId).run();
  return { success: true, orderId, totalAmount: total(items), orderStatus: "placed", paymentMethod: "COD", paymentStatus: "pending" };
}

export async function prepareOnlineCheckout(db, checkout, razorpayOrder, publicKey) {
  const items = await trustedItems(db, checkout.checkoutType, checkout.productId, checkout.quantity, checkout.userId);
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
    if (session.checkout_type === "CART") statements.push(db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(session.user_id));
    await db.batch(statements);
    return { orderId, duplicate: false };
  } catch (error) {
    await db.prepare("UPDATE checkout_sessions SET status = 'failed' WHERE id = ?").bind(session.id).run().catch(() => {});
    throw error;
  }
}

export async function getOrders(db, userId) {
  const { results: orders } = await db.prepare(`SELECT o.id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, a.full_name, a.city, a.state FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.user_id = ? ORDER BY o.created_at DESC`).bind(userId).all();
  for (const order of orders) {
    const { results: items } = await db.prepare(`SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.slug, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) AS image FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY oi.id`).bind(order.id).all();
    order.items = items;
  }
  return orders;
}

export async function getOrderById(db, orderId, userId) {
  const order = await db.prepare(`SELECT o.id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at, o.razorpay_order_id, o.razorpay_payment_id, o.paid_at, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country FROM orders o JOIN addresses a ON a.id = o.address_id WHERE o.id = ? AND o.user_id = ? LIMIT 1`).bind(orderId, userId).first();
  if (!order) return null;
  const { results } = await db.prepare(`SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.slug, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) AS image FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY oi.id`).bind(orderId).all();
  order.items = results;
  return order;
}
