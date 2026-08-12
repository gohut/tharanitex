import { WishlistRepository } from "../repositories/WishlistRepository";
import { ProductRepository } from "../repositories/ProductRepository";

export class WishlistService {
  static async getWishlist(userId) {
    return await WishlistRepository.findByUserId(userId);
  }

  static async addItem(userId, productId) {
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existing = await WishlistRepository.findItem(userId, productId);
    if (existing) {
      return existing; // Already in wishlist
    }

    return await WishlistRepository.create(userId, productId);
  }

  static async removeItem(userId, wishlistItemId) {
    const wishlist = await WishlistRepository.findByUserId(userId);
    const item = wishlist.find(w => w.wishlist_item_id === wishlistItemId);
    if (!item) {
      throw new Error("Wishlist item not found or unauthorized");
    }
    return await WishlistRepository.delete(wishlistItemId);
  }

  static async removeItemByProduct(userId, productId) {
    return await WishlistRepository.deleteByProductAndUser(userId, productId);
  }
}
