import { OrderService } from "../services/OrderService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate, authenticateAdmin } from "../middleware/auth";

export class OrderController {
  static async checkout(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      if (!body.address_id) {
        return ApiResponse.badRequest("Shipping address ID is required");
      }

      const order = await OrderService.checkout(payload.id, {
        address_id: body.address_id,
        coupon_code: body.coupon_code,
        payment_method: body.payment_method,
      });

      return ApiResponse.success(order, "Order placed successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async getCustomerOrders(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const orders = await OrderService.getCustomerOrders(payload.id);
      return ApiResponse.success(orders);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getCustomerOrderById(request, { params }) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const order = await OrderService.getCustomerOrderById(payload.id, orderId);
      return ApiResponse.success(order);
    } catch (error) {
      return ApiResponse.error(error.message, 404);
    }
  }

  static async adminGetOrders(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const orders = await OrderService.getOrders();
      return ApiResponse.success(orders);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminUpdateOrderStatus(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const orderId = resolvedParams.id;
      const body = await request.json();
      if (!body.status) {
        return ApiResponse.badRequest("New status is required");
      }

      // Valid statuses: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(body.status)) {
        return ApiResponse.badRequest("Invalid status value");
      }

      await OrderService.updateOrderStatus(orderId, body.status);
      return ApiResponse.success(null, `Order status updated to ${body.status}`);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}
