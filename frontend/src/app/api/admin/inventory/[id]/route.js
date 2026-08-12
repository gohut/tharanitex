import { ProductService } from "@/services/ProductService";
import { ApiResponse } from "@/utils/ApiResponse";
import { authenticateAdmin } from "@/middleware/auth";

export const runtime = "edge";

export async function PUT(request, { params }) {
  try {
    if (!await authenticateAdmin(request)) {
      return ApiResponse.forbidden("Admin access required");
    }
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    if (body.quantity === undefined) {
      return ApiResponse.badRequest("Adjust quantity is required");
    }

    const result = await ProductService.adjustInventory(id, Number(body.quantity));
    return ApiResponse.success(result, "Inventory updated successfully");
  } catch (error) {
    return ApiResponse.error(error.message, 400);
  }
}
