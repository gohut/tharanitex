import { CategoryRepository } from "../repositories/CategoryRepository";

export class CategoryService {
  static async getCategories() {
    return await CategoryRepository.findAll();
  }

  static async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  static async createCategory(data) {
    const existing = await CategoryRepository.findByName(data.name);
    if (existing) {
      throw new Error("Category name already exists");
    }
    const id = "cat_" + crypto.randomUUID();
    return await CategoryRepository.create({ id, ...data });
  }

  static async updateCategory(id, data) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    const existing = await CategoryRepository.findByName(data.name);
    if (existing && existing.id !== id) {
      throw new Error("Category name already exists");
    }
    return await CategoryRepository.update(id, data);
  }

  static async deleteCategory(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return await CategoryRepository.delete(id);
  }
}
