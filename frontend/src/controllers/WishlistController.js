import { WishlistService } from "../services/WishlistService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";

export class WishlistController {
  static async getWishlist(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const wishlist = await WishlistService.getWishlist(payload.id);
      return ApiResponse.success(wishlist);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async addToWishlist(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      if (!body.product_id) {
        return ApiResponse.badRequest("Product ID is required");
      }

      const item = await WishlistService.addItem(payload.id, body.product_id);
      return ApiResponse.success(item, "Item added to wishlist", 201);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async removeFromWishlist(request, { params }, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const wishlistItemId = resolvedParams.id;

      await WishlistService.removeItem(payload.id, wishlistItemId);
      return ApiResponse.success(null, "Item removed from wishlist");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}

