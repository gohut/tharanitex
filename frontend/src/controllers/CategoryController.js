import { CategoryService } from "../services/CategoryService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticateAdmin } from "../middleware/auth";

export class CategoryController {
  static async getCategories(request) {
    try {
      const categories = await CategoryService.getCategories();
      return ApiResponse.success(categories);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getCategoryById(request, { params }) {
    try {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const category = await CategoryService.getCategoryById(id);
      return ApiResponse.success(category);
    } catch (error) {
      return ApiResponse.error(error.message, 404);
    }
  }

  static async adminCreateCategory(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const body = await request.json();
      const valErrors = Validators.validateCategory(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const category = await CategoryService.createCategory(body);
      return ApiResponse.success(category, "Category created successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminUpdateCategory(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const body = await request.json();
      const valErrors = Validators.validateCategory(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const category = await CategoryService.updateCategory(id, body);
      return ApiResponse.success(category, "Category updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminDeleteCategory(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      await CategoryService.deleteCategory(id);
      return ApiResponse.success(null, "Category deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
}
