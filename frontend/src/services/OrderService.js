import { OrderRepository } from "../repositories/OrderRepository";
import { CartRepository } from "../repositories/CartRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { AddressRepository } from "../repositories/AddressRepository";
import { CouponRepository } from "../repositories/CouponRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";

export class OrderService {
  static async checkout(userId, { address_id, coupon_code, payment_method }) {
    // 1. Fetch address
    const address = await AddressRepository.findById(address_id);
    if (!address || address.user_id !== userId) {
      throw new Error("Invalid shipping address");
    }

    // 2. Fetch cart
    const cartItems = await CartRepository.findByUserId(userId);
    if (cartItems.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    // 3. Verify stock and calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`Product ${item.name} has insufficient stock (Only ${item.stock} available)`);
      }
      subtotal += item.price * item.quantity;
    }

    // 4. Handle coupon discount if provided
    let discount = 0;
    let appliedCoupon = null;
    if (coupon_code) {
      const coupon = await CouponRepository.findByCode(coupon_code);
      if (coupon && coupon.status === "active" && new Date(coupon.expires_at) > new Date()) {
        if (subtotal >= coupon.min_purchase) {
          appliedCoupon = coupon;
          if (coupon.discount_type === "percentage") {
            discount = subtotal * (coupon.discount_value / 100);
          } else {
            discount = coupon.discount_value;
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);
    const orderId = "ord_" + crypto.randomUUID();

    // 5. Create Order
    await OrderRepository.create({
      id: orderId,
      user_id: userId,
      address_id,
      status: "pending",
      total_amount: totalAmount,
    });

    // 6. Create Order Items and Update Product Inventory
    for (const item of cartItems) {
      const orderItemId = "ori_" + crypto.randomUUID();
      const totalPrice = item.price * item.quantity;
      
      await OrderRepository.createItem({
        id: orderItemId,
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: totalPrice,
      });

      // Decrement product stock
      const newStock = item.stock - item.quantity;
      await ProductRepository.updateStock(item.product_id, newStock);
    }

    // 7. Create Payment Entry
    await PaymentRepository.create({
      order_id: orderId,
      amount: totalAmount,
      method: payment_method || "cod",
      status: payment_method === "cod" ? "pending" : "pending",
      transaction_id: null,
    });

    // 8. Clear Cart
    await CartRepository.deleteByUserId(userId);

    return await OrderRepository.findById(orderId);
  }

  static async getOrders() {
    return await OrderRepository.findAll();
  }

  static async getOrderById(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  static async getCustomerOrders(userId) {
    return await OrderRepository.findByUserId(userId);
  }

  static async getCustomerOrderById(userId, orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw new Error("Order not found or unauthorized");
    }
    return order;
  }

  static async updateOrderStatus(orderId, status) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const currentStatus = order.status;
    if (currentStatus === status) {
      return true;
    }

    // Restock if order is cancelled
    if (status === "cancelled" && currentStatus !== "cancelled") {
      for (const item of order.items) {
        const product = await ProductRepository.findById(item.product_id);
        if (product) {
          await ProductRepository.updateStock(item.product_id, product.stock + item.quantity);
        }
      }
      // Also update payment status to failed/refunded if needed
      const payment = await PaymentRepository.findByOrderId(orderId);
      if (payment && payment.status === "completed") {
        await PaymentRepository.updateStatus(orderId, "refunded");
      } else if (payment) {
        await PaymentRepository.updateStatus(orderId, "failed");
      }
    }

    return await OrderRepository.updateStatus(orderId, status);
  }
}
