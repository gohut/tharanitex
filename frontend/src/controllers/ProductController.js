import { ProductService } from "../services/ProductService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticateAdmin } from "../middleware/auth";

export class ProductController {
  static async queryProducts(request) {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const category_id = searchParams.get("category_id");
      const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
      const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
      const fabric = searchParams.get("fabric");
      const color = searchParams.get("color");
      const sort = searchParams.get("sort");
      const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
      const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
      const offset = (page - 1) * limit;

      const products = await ProductService.getProducts({
        search,
        category_id,
        min_price,
        max_price,
        fabric,
        color,
        sort,
        limit,
        offset,
      });

      return ApiResponse.success(products);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getProductById(request, { params }) {
    try {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const product = await ProductService.getProductById(id);
      return ApiResponse.success(product);
    } catch (error) {
      return ApiResponse.error(error.message, 404);
    }
  }

  static async adminGetProducts(request, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const products = await ProductService.getAllProductsAdmin();
      return ApiResponse.success(products);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminCreateProduct(request, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const body = await request.json();
      const valErrors = Validators.validateProduct(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const product = await ProductService.createProduct(body);
      return ApiResponse.success(product, "Product created successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminUpdateProduct(request, { params }, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const body = await request.json();
      const valErrors = Validators.validateProduct(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const product = await ProductService.updateProduct(id, body);
      return ApiResponse.success(product, "Product updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminDeleteProduct(request, { params }, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      await ProductService.deleteProduct(id);
      return ApiResponse.success(null, "Product deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
}
