import { CartRepository } from "../repositories/CartRepository";
import { ProductRepository } from "../repositories/ProductRepository";

export class CartService {
  static async getCart(userId) {
    return await CartRepository.findByUserId(userId);
  }

  static async addItem(userId, productId, quantity) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} units of this product are in stock`);
    }

    const existing = await CartRepository.findItem(userId, productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        throw new Error(`Cannot add more. Only ${product.stock} units are in stock`);
      }
      await CartRepository.updateQuantity(existing.id, newQty);
      return { id: existing.id, quantity: newQty };
    }

    return await CartRepository.create(userId, productId, quantity);
  }

  static async updateQuantity(userId, cartItemId, quantity) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const cart = await CartRepository.findByUserId(userId);
    const item = cart.find(i => i.cart_item_id === cartItemId);
    if (!item) {
      throw new Error("Cart item not found or unauthorized");
    }

    const product = await ProductRepository.findById(item.product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} units are in stock`);
    }

    await CartRepository.updateQuantity(cartItemId, quantity);
    return { cartItemId, quantity };
  }

  static async removeItem(userId, cartItemId) {
    const cart = await CartRepository.findByUserId(userId);
    const item = cart.find(i => i.cart_item_id === cartItemId);
    if (!item) {
      throw new Error("Cart item not found or unauthorized");
    }
    return await CartRepository.delete(cartItemId);
  }

  static async clearCart(userId) {
    return await CartRepository.deleteByUserId(userId);
  }
}
