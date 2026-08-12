import { CartService } from "../services/CartService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";

export class CartController {
  static async getCart(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const cart = await CartService.getCart(payload.id);
      return ApiResponse.success(cart);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async addToCart(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      if (!body.product_id) {
        return ApiResponse.badRequest("Product ID is required");
      }
      const quantity = body.quantity ? Number(body.quantity) : 1;

      const item = await CartService.addItem(payload.id, body.product_id, quantity);
      return ApiResponse.success(item, "Item added to cart", 201);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async updateCartItem(request, { params }) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const cartItemId = resolvedParams.id;
      const body = await request.json();
      if (body.quantity === undefined) {
        return ApiResponse.badRequest("Quantity is required");
      }

      const item = await CartService.updateQuantity(payload.id, cartItemId, Number(body.quantity));
      return ApiResponse.success(item, "Cart item updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async deleteCartItem(request, { params }) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const cartItemId = resolvedParams.id;

      await CartService.removeItem(payload.id, cartItemId);
      return ApiResponse.success(null, "Item removed from cart");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}
