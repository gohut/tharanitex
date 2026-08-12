import { ProductRepository } from "../repositories/ProductRepository";
import { ReviewRepository } from "../repositories/ReviewRepository";

export class ProductService {
  static async getProducts(filters) {
    return await ProductRepository.query(filters);
  }

  static async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const reviews = await ReviewRepository.findByProductId(id);
    return { ...product, reviews };
  }

  static async getAllProductsAdmin() {
    return await ProductRepository.findAll();
  }

  static async createProduct(data) {
    const id = "prd_" + crypto.randomUUID();
    return await ProductRepository.create({ id, ...data });
  }

  static async updateProduct(id, data) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      throw new Error("Product not found");
    }
    return await ProductRepository.update(id, data);
  }

  static async deleteProduct(id) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      throw new Error("Product not found");
    }
    return await ProductRepository.delete(id);
  }

  static async adjustInventory(id, quantity) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error("Inventory level cannot be negative");
    }
    await ProductRepository.updateStock(id, newStock);
    return { id, stock: newStock };
  }

  static async getLowStockProducts(threshold = 5) {
    return await ProductRepository.findLowStock(threshold);
  }
}
