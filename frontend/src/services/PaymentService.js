import { PaymentRepository } from "../repositories/PaymentRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { OrderService } from "./OrderService";

export class PaymentService {
  static async initializePayment(orderId, method) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const transactionId = "tx_" + Math.random().toString(36).substring(2, 11);
    
    // Update the transaction details
    await PaymentRepository.updateStatus(orderId, "pending", transactionId);

    return {
      order_id: orderId,
      amount: order.total_amount,
      method,
      transaction_id: transactionId,
      checkout_url: `/api/payment?session_id=${transactionId}`,
    };
  }

  static async handleWebhook(event) {
    // Expected structure: { type: "payment.succeeded" | "payment.failed", transaction_id: "..." }
    const { type, transaction_id } = event;
    if (!transaction_id) {
      throw new Error("Transaction ID is required in webhook payload");
    }

    const payment = await PaymentRepository.findByTransactionId(transaction_id);
    if (!payment) {
      throw new Error(`Payment record not found for transaction: ${transaction_id}`);
    }

    if (type === "payment.succeeded") {
      await PaymentRepository.updateStatus(payment.order_id, "completed");
      await OrderService.updateOrderStatus(payment.order_id, "processing");
      return { success: true, message: "Payment completed. Order updated to processing." };
    } else if (type === "payment.failed") {
      await PaymentRepository.updateStatus(payment.order_id, "failed");
      await OrderService.updateOrderStatus(payment.order_id, "cancelled");
      return { success: true, message: "Payment failed. Order cancelled and items restocked." };
    }

    return { success: false, message: "Unhandled webhook event type" };
  }
}
